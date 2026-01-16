package com.devkit.secrets.rest;

import com.devkit.secrets.domain.SecretRotationEntity;

import java.time.Instant;

/**
 * Response DTO for secret rotation history.
 */
public record SecretRotationResponse(
    String id,
    String secretId,
    String secretKey,
    String applicationId,
    String environmentId,
    Integer previousVersion,
    Integer newVersion,
    String rotatedBy,
    String status,
    String reason,
    String errorMessage,
    Instant rotationDate
) {
    static SecretRotationResponse fromEntity(SecretRotationEntity entity) {
        return new SecretRotationResponse(
            entity.getId(),
            entity.getSecretId(),
            entity.getSecretKey(),
            entity.getApplicationId(),
            entity.getEnvironmentId(),
            entity.getPreviousVersion(),
            entity.getNewVersion(),
            entity.getRotatedBy(),
            entity.getStatus().name(),
            entity.getReason().name(),
            entity.getErrorMessage(),
            entity.getRotationDate()
        );
    }
}
