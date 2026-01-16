package com.devkit.sdk.model;

import java.time.LocalDateTime;

/**
 * Represents a feature flag.
 */
public record FeatureFlag(
    String id,
    String key,
    String name,
    String description,
    String status,
    String rolloutStrategy,
    Integer rolloutPercentage,
    String applicationId,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
}
