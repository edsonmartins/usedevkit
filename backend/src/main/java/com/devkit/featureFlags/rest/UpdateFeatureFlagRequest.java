package com.devkit.featureFlags.rest;

import jakarta.validation.constraints.Size;

/**
 * Request DTO for updating a Feature Flag.
 */
public record UpdateFeatureFlagRequest(

    @Size(min = 3, max = 255, message = "Feature flag name must be between 3 and 255 characters")
    String name,

    @Size(max = 1000, message = "Description cannot exceed 1000 characters")
    String description,

    String status,

    Integer rolloutPercentage,

    String targetingRules
) {
}
