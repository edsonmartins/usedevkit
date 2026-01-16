package com.devkit.featureFlags.rest;

import com.devkit.featureFlags.domain.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

/**
 * REST Controller for Feature Flags.
 */
@RestController
@RequestMapping("/api/v1/feature-flags")
@Tag(name = "Feature Flags", description = "Feature flag management APIs")
public class FeatureFlagController {

    private final FeatureFlagCommandService commandService;
    private final FeatureFlagQueryService queryService;

    FeatureFlagController(
            FeatureFlagCommandService commandService,
            FeatureFlagQueryService queryService) {
        this.commandService = commandService;
        this.queryService = queryService;
    }

    @PostMapping
    @Operation(summary = "Create a new feature flag", description = "Creates a new feature flag with the provided details")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Feature flag created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input")
    })
    ResponseEntity<FeatureFlagResponse> createFeatureFlag(@Valid @RequestBody CreateFeatureFlagRequest request) {
        var cmd = new CreateFeatureFlagCmd(
            request.applicationId(),
            request.key(),
            request.name(),
            request.description(),
            request.status(),
            request.rolloutStrategy(),
            request.rolloutPercentage(),
            request.targetingRules()
        );

        String featureFlagId = commandService.createFeatureFlag(cmd);
        var result = queryService.getFeatureFlagById(featureFlagId);

        return ResponseEntity
            .created(URI.create("/api/v1/feature-flags/" + featureFlagId))
            .body(FeatureFlagResponse.from(result));
    }

    @GetMapping("/application/{applicationId}")
    @Operation(summary = "Get feature flags by application", description = "Retrieves all feature flags for an application")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Feature flags retrieved successfully")
    })
    ResponseEntity<List<FeatureFlagResponse>> getFeatureFlagsByApplication(@PathVariable String applicationId) {
        var flags = queryService.getFeatureFlagsByApplication(applicationId);
        var responses = flags.stream()
            .map(FeatureFlagResponse::from)
            .toList();

        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get feature flag by ID", description = "Retrieves a feature flag by its ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Feature flag retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Feature flag not found")
    })
    ResponseEntity<FeatureFlagResponse> getFeatureFlagById(@PathVariable String id) {
        var result = queryService.getFeatureFlagById(id);
        return ResponseEntity.ok(FeatureFlagResponse.from(result));
    }

    @GetMapping("/application/{applicationId}/key/{key}")
    @Operation(summary = "Get feature flag by application and key", description = "Retrieves a feature flag by application and key")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Feature flag retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Feature flag not found")
    })
    ResponseEntity<FeatureFlagResponse> getFeatureFlagByKey(
            @PathVariable String applicationId,
            @PathVariable String key) {
        var result = queryService.getFeatureFlagByKey(applicationId, key);
        return ResponseEntity.ok(FeatureFlagResponse.from(result));
    }

    @GetMapping("/application/{applicationId}/enabled")
    @Operation(summary = "Get enabled feature flags", description = "Retrieves all enabled feature flags for an application")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Enabled feature flags retrieved successfully")
    })
    ResponseEntity<List<FeatureFlagResponse>> getEnabledFeatureFlags(@PathVariable String applicationId) {
        var flags = queryService.getEnabledFeatureFlags(applicationId);
        var responses = flags.stream()
            .map(FeatureFlagResponse::from)
            .toList();

        return ResponseEntity.ok(responses);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update feature flag", description = "Updates an existing feature flag")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Feature flag updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input"),
        @ApiResponse(responseCode = "404", description = "Feature flag not found")
    })
    ResponseEntity<FeatureFlagResponse> updateFeatureFlag(
            @PathVariable String id,
            @Valid @RequestBody UpdateFeatureFlagRequest request) {

        var cmd = new UpdateFeatureFlagCmd(
            id,
            request.name(),
            request.description(),
            request.status(),
            request.rolloutPercentage(),
            request.targetingRules()
        );

        commandService.updateFeatureFlag(cmd);

        var result = queryService.getFeatureFlagById(id);
        return ResponseEntity.ok(FeatureFlagResponse.from(result));
    }

    @PostMapping("/{id}/enable")
    @Operation(summary = "Enable feature flag", description = "Enables a disabled feature flag")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Feature flag enabled successfully"),
        @ApiResponse(responseCode = "404", description = "Feature flag not found")
    })
    ResponseEntity<FeatureFlagResponse> enableFeatureFlag(@PathVariable String id) {
        commandService.enableFeatureFlag(id);
        var result = queryService.getFeatureFlagById(id);
        return ResponseEntity.ok(FeatureFlagResponse.from(result));
    }

    @PostMapping("/{id}/disable")
    @Operation(summary = "Disable feature flag", description = "Disables an enabled feature flag")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Feature flag disabled successfully"),
        @ApiResponse(responseCode = "404", description = "Feature flag not found")
    })
    ResponseEntity<FeatureFlagResponse> disableFeatureFlag(@PathVariable String id) {
        commandService.disableFeatureFlag(id);
        var result = queryService.getFeatureFlagById(id);
        return ResponseEntity.ok(FeatureFlagResponse.from(result));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete feature flag", description = "Deletes a feature flag permanently")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Feature flag deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Feature flag not found")
    })
    ResponseEntity<Void> deleteFeatureFlag(@PathVariable String id) {
        commandService.deleteFeatureFlag(id);
        return ResponseEntity.noContent().build();
    }
}
