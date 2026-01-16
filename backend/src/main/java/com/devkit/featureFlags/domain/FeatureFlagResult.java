package com.devkit.featureFlags.domain;

import com.devkit.featureFlags.domain.vo.FeatureFlagId;

import java.time.Instant;
import java.util.Set;

/**
 * Result object for Feature Flag operations.
 */
public record FeatureFlagResult(
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
    Set<VariantResult> variants,
    Instant createdAt,
    Instant updatedAt
) {
    public record VariantResult(
        String id,
        String key,
        String name,
        String description,
        Integer rolloutPercentage,
        String payload,
        Boolean isControl
    ) {}

    public static FeatureFlagResult from(FeatureFlagEntity entity) {
        Set<VariantResult> variants = entity.getVariants().stream()
                .map(v -> new VariantResult(
                        v.getId(),
                        v.getKey(),
                        v.getName(),
                        v.getDescription(),
                        v.getRolloutPercentage(),
                        v.getPayload(),
                        v.isControl()
                ))
                .collect(java.util.stream.Collectors.toSet());

        return new FeatureFlagResult(
                entity.getId().id(),
                entity.getKey(),
                entity.getName(),
                entity.getDescription(),
                entity.getStatus().name(),
                entity.getRolloutStrategy().name(),
                entity.getRolloutPercentage(),
                entity.getTargetingRules(),
                entity.getApplicationId(),
                entity.isActive(),
                variants,
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}
