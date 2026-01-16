package com.devkit.featureFlags.domain.events;

/**
 * Domain event published when a Feature Flag is enabled.
 */
public record FeatureFlagEnabledEvent(
    String featureFlagId,
    String key
) {
}
