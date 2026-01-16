package com.devkit.featureFlags.domain.events;

/**
 * Domain event published when a Feature Flag is created.
 */
public record FeatureFlagCreatedEvent(
    String featureFlagId,
    String key,
    String name,
    String applicationId
) {
}
