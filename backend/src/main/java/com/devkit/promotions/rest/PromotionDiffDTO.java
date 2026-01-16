package com.devkit.promotions.rest;

import com.devkit.promotions.domain.PromotionDiffEntity;

import java.time.Instant;

/**
 * DTO for promotion diff.
 */
public record PromotionDiffDTO(

    String id,
    String promotionRequestId,
    String configKey,
    String sourceValue,
    String targetValue,
    String sourceType,
    String targetType,
    Integer sourceVersion,
    Integer targetVersion,
    PromotionDiffEntity.ChangeType changeType,
    Instant createdAt

) {
    public static PromotionDiffDTO fromEntity(PromotionDiffEntity entity) {
        return new PromotionDiffDTO(
            entity.getId(),
            entity.getPromotionRequestId(),
            entity.getConfigKey(),
            entity.getSourceValue(),
            entity.getTargetValue(),
            entity.getSourceType(),
            entity.getTargetType(),
            entity.getSourceVersion(),
            entity.getTargetVersion(),
            entity.getChangeType(),
            entity.getCreatedAt()
        );
    }
}
