package com.devkit.secrets.domain;

import com.devkit.secrets.domain.SecretEntity.RotationPolicy;

import java.time.Instant;
import java.time.LocalDateTime;

/**
 * Result DTO for secret queries (without decrypted value).
 */
public record SecretResult(
    String id,
    String key,
    String description,
    String applicationId,
    String environmentId,
    RotationPolicy rotationPolicy,
    Instant lastRotationDate,
    Instant nextRotationDate,
    Boolean isActive,
    Integer versionNumber,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
    public static SecretResult from(SecretEntity entity) {
        return new SecretResult(
            entity.getId().id(),
            entity.getKey(),
            entity.getDescription(),
            entity.getApplicationId(),
            entity.getEnvironmentId(),
            entity.getRotationPolicy(),
            entity.getLastRotationDate(),
            entity.getNextRotationDate(),
            entity.isActive(),
            entity.getVersionNumber(),
            entity.getCreatedAt(),
            entity.getUpdatedAt()
        );
    }
}
