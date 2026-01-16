package com.devkit.sdk;

import com.devkit.sdk.http.HttpClient;
import com.devkit.sdk.model.Configuration;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.function.Consumer;

/**
 * Hot Reload Configuration Client.
 * Automatically polls for configuration updates and notifies listeners.
 */
public class HotReloadConfigClient {

    private final HttpClient httpClient;
    private final ConfigCache cache;
    private final String environmentId;
    private final ScheduledExecutorService scheduler;
    private final long pollingIntervalMs;
    private final long timeoutMs;

    private Instant lastUpdate;
    private Consumer<Map<String, String>> updateListener;
    private boolean isRunning;

    public HotReloadConfigClient(
            HttpClient httpClient,
            String environmentId,
            long pollingIntervalMs,
            long timeoutMs) {
        this.httpClient = httpClient;
        this.environmentId = environmentId;
        this.pollingIntervalMs = pollingIntervalMs;
        this.timeoutMs = timeoutMs;
        this.cache = new ConfigCache(timeoutMs);
        this.scheduler = Executors.newSingleThreadScheduledExecutor();
        this.lastUpdate = Instant.EPOCH;
        this.isRunning = false;
    }

    /**
     * Start hot reload polling.
     * @param onUpdate Callback function invoked when configurations change
     */
    public void start(Consumer<Map<String, String>> onUpdate) {
        if (isRunning) {
            return; // Already running
        }

        this.updateListener = onUpdate;
        this.isRunning = true;

        // Initial load
        fetchAndNotify();

        // Schedule periodic polling
        scheduler.scheduleAtFixedRate(
                this::pollForUpdates,
                pollingIntervalMs,
                pollingIntervalMs,
                TimeUnit.MILLISECONDS
        );
    }

    /**
     * Stop hot reload polling.
     */
    public void stop() {
        isRunning = false;
        scheduler.shutdown();
    }

    /**
     * Get current configuration value (from cache).
     */
    public String getConfig(String key) {
        String cacheKey = String.format("config:%s:%s", environmentId, key);
        return cache.get(cacheKey, String.class);
    }

    /**
     * Get all configurations as map (from cache).
     */
    public Map<String, String> getAllConfigs() {
        String cacheKey = String.format("config_map:%s", environmentId);
        return cache.get(cacheKey, Map.class);
    }

    /**
     * Force refresh configurations from server.
     */
    public void refresh() {
        fetchAndNotify();
    }

    /**
     * Poll for configuration updates using long polling.
     */
    private void pollForUpdates() {
        try {
            long lastUpdateMs = lastUpdate.toEpochMilli();

            // Long poll request
            var response = httpClient.get(
                    String.format("/api/v1/configurations/environment/%s/poll?lastUpdate=%d&timeout=30",
                            environmentId, lastUpdateMs),
                    PollingResponse.class
            );

            if (response.hasUpdates()) {
                // Update cache with new configurations
                Map<String, String> configs = response.configurations();
                String cacheKey = String.format("config_map:%s", environmentId);
                cache.put(cacheKey, configs);

                // Update individual config cache entries
                configs.forEach((key, value) -> {
                    String keyCache = String.format("config:%s:%s", environmentId, key);
                    cache.put(keyCache, value);
                });

                lastUpdate = Instant.ofEpochMilli(response.lastUpdate());

                // Notify listener
                if (updateListener != null) {
                    updateListener.accept(configs);
                }
            }

        } catch (Exception e) {
            // Log error but continue polling
            System.err.println("Error polling for configuration updates: " + e.getMessage());
        }
    }

    /**
     * Fetch configurations and notify listener.
     */
    private void fetchAndNotify() {
        try {
            Map<String, String> configs = httpClient.get(
                    String.format("/api/v1/configurations/environment/%s/map", environmentId),
                    Map.class
            );

            String cacheKey = String.format("config_map:%s", environmentId);
            cache.put(cacheKey, configs);

            // Notify listener with initial configs
            if (updateListener != null) {
                updateListener.accept(configs);
            }

        } catch (Exception e) {
            System.err.println("Error fetching initial configurations: " + e.getMessage());
        }
    }

    public Instant getLastUpdate() {
        return lastUpdate;
    }

    public boolean isRunning() {
        return isRunning;
    }

    // Record class for polling response
    private record PollingResponse(
            boolean hasUpdates,
            Map<String, String> configurations,
            long lastUpdate
    ) {}
}
