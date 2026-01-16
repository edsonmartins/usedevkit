package com.devkit.featureFlags.domain;

/**
 * Command for creating a new Feature Flag.
 */
public record CreateFeatureFlagCmd(
    String applicationId,
    String key,
    String name,
    String description,
    String status,
    String rolloutStrategy,
    Integer rolloutPercentage,
    String targetingRules
) {
    public CreateFeatureFlagCmd {
        if (applicationId == null || applicationId.trim().isBlank()) {
            throw new IllegalArgumentException("Application id cannot be null or empty");
        }
        if (key == null || key.trim().isBlank()) {
            throw new IllegalArgumentException("Feature flag key cannot be null or empty");
        }
        if (name == null || name.trim().isBlank()) {
            throw new IllegalArgumentException("Feature flag name cannot be null or empty");
        }
    }
}
