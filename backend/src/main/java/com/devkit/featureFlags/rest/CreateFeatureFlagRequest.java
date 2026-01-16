package com.devkit.featureFlags.rest;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Request DTO for creating a new Feature Flag.
 */
public record CreateFeatureFlagRequest(

    @NotBlank(message = "Application ID is required")
    String applicationId,

    @NotBlank(message = "Feature flag key is required")
    @Size(min = 2, max = 100, message = "Feature flag key must be between 2 and 100 characters")
    String key,

    @NotBlank(message = "Feature flag name is required")
    @Size(min = 3, max = 255, message = "Feature flag name must be between 3 and 255 characters")
    String name,

    @Size(max = 1000, message = "Description cannot exceed 1000 characters")
    String description,

    String status,

    String rolloutStrategy,

    Integer rolloutPercentage,

    String targetingRules
) {
}
