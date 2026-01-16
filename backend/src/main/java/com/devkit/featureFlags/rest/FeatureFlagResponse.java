package com.devkit.featureFlags.rest;

import com.devkit.featureFlags.domain.FeatureFlagResult;

import java.time.Instant;
import java.util.Set;

/**
 * Response DTO for Feature Flag operations.
 */
public record FeatureFlagResponse(
    String id,
    String key,
    String name,
    String description,
    String status,
    String rolloutStrategy,
    Integer rolloutPercentage,
    String targetingRules,
    String applicationId,
    Boolean isActive,
    Set<VariantResponse> variants,
    Instant createdAt,
    Instant updatedAt
) {
    public record VariantResponse(
        String id,
        String key,
        String name,
        String description,
        Integer rolloutPercentage,
        String payload,
        Boolean isControl
    ) {}

    public static FeatureFlagResponse from(FeatureFlagResult result) {
        Set<VariantResponse> variants = result.variants().stream()
            .map(v -> new VariantResponse(
                v.id(),
                v.key(),
                v.name(),
                v.description(),
                v.rolloutPercentage(),
                v.payload(),
                v.isControl()
            ))
            .collect(java.util.stream.Collectors.toSet());

        return new FeatureFlagResponse(
            result.id(),
            result.key(),
            result.name(),
            result.description(),
            result.status(),
            result.rolloutStrategy(),
            result.rolloutPercentage(),
            result.targetingRules(),
            result.applicationId(),
            result.isActive(),
            variants,
            result.createdAt(),
            result.updatedAt()
        );
    }
}
