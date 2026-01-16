package com.devkit.configurations.rest;

import com.devkit.configurations.domain.ConfigurationQueryService;
import com.devkit.configurations.domain.ConfigurationResult;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * REST Controller for Configuration Long Polling and SSE.
 * Enables real-time configuration updates without polling.
 */
@RestController
@RequestMapping("/api/v1/configurations")
@Tag(name = "Configuration Polling", description = "Real-time configuration update APIs")
public class ConfigurationPollingController {

    private final ConfigurationQueryService queryService;
    private final ExecutorService executorService = Executors.newCachedThreadPool();
    private final Map<String, Instant> lastUpdateMap = new ConcurrentHashMap<>();

    ConfigurationPollingController(ConfigurationQueryService queryService) {
        this.queryService = queryService;
    }

    /**
     * Long polling endpoint for configuration updates.
     * Waits up to timeout seconds for changes before returning.
     *
     * @param environmentId Environment to watch
     * @param lastUpdate Last update timestamp from client (milliseconds since epoch)
     * @param timeout Maximum time to wait in seconds (default: 30, max: 60)
     * @return Configuration map with update indicator
     */
    @GetMapping(value = "/environment/{environmentId}/poll", produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Long polling for configuration updates", description = """
        Waits for configuration changes or timeout.
        Returns configurations only if there are changes since lastUpdate timestamp.
        Use this for efficient real-time updates without constant polling.
        """)
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Configurations returned (may be empty if no changes)"),
        @ApiResponse(responseCode = "400", description = "Invalid parameters")
    })
    ResponseEntity<PollingResponse> pollConfigurations(
            @PathVariable String environmentId,
            @Parameter(description = "Last update timestamp in milliseconds since epoch")
            @RequestParam(required = false) Long lastUpdate,
            @Parameter(description = "Maximum wait time in seconds (default: 30, max: 60)")
            @RequestParam(defaultValue = "30") int timeout
    ) {
        // Validate timeout
        if (timeout < 1 || timeout > 60) {
            return ResponseEntity.badRequest().build();
        }

        Instant clientLastUpdate = lastUpdate != null ? Instant.ofEpochMilli(lastUpdate) : Instant.EPOCH;
        Instant serverLastUpdate = getLastUpdateTimestamp(environmentId);

        // If server has newer updates, return immediately
        if (serverLastUpdate.isAfter(clientLastUpdate)) {
            Map<String, String> configs = queryService.getConfigurationMap(environmentId);
            return ResponseEntity.ok(new PollingResponse(true, configs, serverLastUpdate.toEpochMilli()));
        }

        // Wait for changes or timeout
        try {
            long startTime = System.currentTimeMillis();
            long maxWaitMs = timeout * 1000L;
            long checkInterval = 500; // Check every 500ms

            while ((System.currentTimeMillis() - startTime) < maxWaitMs) {
                Thread.sleep(checkInterval);

                Instant currentLastUpdate = getLastUpdateTimestamp(environmentId);
                if (currentLastUpdate.isAfter(clientLastUpdate)) {
                    Map<String, String> configs = queryService.getConfigurationMap(environmentId);
                    return ResponseEntity.ok(new PollingResponse(true, configs, currentLastUpdate.toEpochMilli()));
                }
            }

            // Timeout - return empty response
            return ResponseEntity.ok(new PollingResponse(false, Map.of(), serverLastUpdate.toEpochMilli()));

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return ResponseEntity.ok(new PollingResponse(false, Map.of(), serverLastUpdate.toEpochMilli()));
        }
    }

    /**
     * Server-Sent Events endpoint for real-time configuration updates.
     * Maintains an open connection and pushes updates as they happen.
     *
     * @param environmentId Environment to watch
     * @return SseEmitter for streaming updates
     */
    @GetMapping(value = "/environment/{environmentId}/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @Operation(summary = "SSE stream for configuration updates", description = """
        Creates a persistent Server-Sent Events connection.
        Pushes configuration updates in real-time as they occur.
        More efficient than long polling for frequently changing configurations.
        """)
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "SSE stream established")
    })
    SseEmitter streamConfigurations(@PathVariable String environmentId) {
        SseEmitter emitter = new SseEmitter(Duration.ofSeconds(300).toMillis()); // 5 minutes timeout

        executorService.execute(() -> {
            try {
                Instant lastUpdate = Instant.EPOCH;
                long checkInterval = 1000; // Check every second

                while (true) {
                    Instant currentLastUpdate = getLastUpdateTimestamp(environmentId);

                    if (currentLastUpdate.isAfter(lastUpdate)) {
                        Map<String, String> configs = queryService.getConfigurationMap(environmentId);
                        emitter.send(SseEmitter.event()
                                .name("configuration-update")
                                .data(new StreamUpdate(configs, currentLastUpdate.toEpochMilli())));

                        lastUpdate = currentLastUpdate;
                    }

                    Thread.sleep(checkInterval);
                }
            } catch (Exception e) {
                emitter.completeWithError(e);
            }
        });

        // Cleanup on timeout or disconnect
        emitter.onCompletion(() -> cleanup(emitter, environmentId));
        emitter.onTimeout(() -> cleanup(emitter, environmentId));

        return emitter;
    }

    /**
     * Get current update timestamp for an environment.
     * Returns the most recent configuration update time.
     *
     * @param environmentId Environment to check
     * @return Timestamp in milliseconds since epoch
     */
    @GetMapping("/environment/{environmentId}/last-update")
    @Operation(summary = "Get last update timestamp", description = "Returns the timestamp of the most recent configuration update")
    @ApiResponse(responseCode = "200", description = "Timestamp returned")
    ResponseEntity<LastUpdateResponse> getLastUpdate(@PathVariable String environmentId) {
        Instant lastUpdate = getLastUpdateTimestamp(environmentId);
        return ResponseEntity.ok(new LastUpdateResponse(lastUpdate.toEpochMilli()));
    }

    /**
     * Get the last update timestamp for an environment.
     * This should be called whenever configurations are created/updated/deleted.
     */
    private Instant getLastUpdateTimestamp(String environmentId) {
        return lastUpdateMap.getOrDefault(environmentId, Instant.EPOCH);
    }

    /**
     * Update the last update timestamp for an environment.
     * This should be called by ConfigurationCommandService after any modification.
     */
    public void markAsUpdated(String environmentId) {
        lastUpdateMap.put(environmentId, Instant.now());
    }

    private void cleanup(SseEmitter emitter, String environmentId) {
        // Cleanup resources
        emitter.complete();
    }

    // Record classes for responses

    record PollingResponse(
            boolean hasUpdates,
            Map<String, String> configurations,
            long lastUpdate
    ) {}

    record StreamUpdate(
            Map<String, String> configurations,
            long timestamp
    ) {}

    record LastUpdateResponse(
            long lastUpdate
    ) {}
}
