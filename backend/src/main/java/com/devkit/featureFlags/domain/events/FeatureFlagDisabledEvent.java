package com.devkit.featureFlags.domain.events;

/**
 * Domain event published when a Feature Flag is disabled.
 */
public record FeatureFlagDisabledEvent(
    String featureFlagId,
    String key
) {
}
