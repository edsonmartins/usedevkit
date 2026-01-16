package com.devkit.featureFlags.domain.events;

/**
 * Domain event published when a Feature Flag is deleted.
 */
public record FeatureFlagDeletedEvent(
    String featureFlagId,
    String key
) {
}
