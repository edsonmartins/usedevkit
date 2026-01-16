package com.devkit.promotions.rest;

import com.devkit.promotions.domain.PromotionRequestEntity;

import java.time.Instant;
import java.util.List;

/**
 * DTO for promotion request.
 */
public record PromotionRequestDTO(

    String id,
    String applicationId,
    String sourceEnvironment,
    String targetEnvironment,
    PromotionRequestEntity.PromotionStatus status,
    String requestedBy,
    String approvedBy,
    String approvalReason,
    String rejectionReason,
    Instant createdAt,
    Instant approvedAt,
    Instant completedAt,
    String errorMessage,
    Boolean includeAllConfigs,
    String configKeys,
    Boolean smokeTestEnabled,
    String smokeTestResult,
    List<PromotionDiffDTO> diffs

) {
    public static PromotionRequestDTO fromEntity(PromotionRequestEntity entity) {
        return new PromotionRequestDTO(
            entity.getId().id(),
            entity.getApplicationId(),
            entity.getSourceEnvironment(),
            entity.getTargetEnvironment(),
            entity.getStatus(),
            entity.getRequestedBy(),
            entity.getApprovedBy(),
            entity.getApprovalReason(),
            entity.getRejectionReason(),
            entity.getCreatedAt(),
            entity.getApprovedAt(),
            entity.getCompletedAt(),
            entity.getErrorMessage(),
            entity.getIncludeAllConfigs(),
            entity.getConfigKeys(),
            entity.getSmokeTestEnabled(),
            entity.getSmokeTestResult(),
            entity.getDiffs().stream()
                .map(PromotionDiffDTO::fromEntity)
                .toList()
        );
    }

    public static PromotionRequestDTO fromEntityWithoutDiffs(PromotionRequestEntity entity) {
        return new PromotionRequestDTO(
            entity.getId().id(),
            entity.getApplicationId(),
            entity.getSourceEnvironment(),
            entity.getTargetEnvironment(),
            entity.getStatus(),
            entity.getRequestedBy(),
            entity.getApprovedBy(),
            entity.getApprovalReason(),
            entity.getRejectionReason(),
            entity.getCreatedAt(),
            entity.getApprovedAt(),
            entity.getCompletedAt(),
            entity.getErrorMessage(),
            entity.getIncludeAllConfigs(),
            entity.getConfigKeys(),
            entity.getSmokeTestEnabled(),
            entity.getSmokeTestResult(),
            List.of()
        );
    }
}
