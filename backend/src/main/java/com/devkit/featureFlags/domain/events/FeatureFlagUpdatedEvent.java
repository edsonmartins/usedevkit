package com.devkit.featureFlags.domain.events;

/**
 * Domain event published when a Feature Flag is updated.
 */
public record FeatureFlagUpdatedEvent(
    String featureFlagId,
    String key
) {
}
