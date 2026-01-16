package com.devkit.featureFlags.domain;

/**
 * Command for updating an existing Feature Flag.
 */
public record UpdateFeatureFlagCmd(
    String featureFlagId,
    String name,
    String description,
    String status,
    Integer rolloutPercentage,
    String targetingRules
) {
    public UpdateFeatureFlagCmd {
        if (featureFlagId == null || featureFlagId.trim().isBlank()) {
            throw new IllegalArgumentException("Feature flag id cannot be null or empty");
        }
    }
}
