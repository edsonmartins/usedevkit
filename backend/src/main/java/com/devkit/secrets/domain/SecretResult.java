package com.devkit.secrets.domain;

import com.devkit.secrets.domain.SecretEntity.RotationPolicy;

import java.time.Instant;

/**
 * Result DTO for secret queries (without decrypted value).
 */
public record SecretResult(
    String id,
    String key,
    String description,
    String applicationId,
    String environmentId,
    SecretEntity.ExternalProvider externalProvider,
    String externalSecretName,
    RotationPolicy rotationPolicy,
    Instant lastRotationDate,
    Instant nextRotationDate,
    Boolean isActive,
    Integer versionNumber,
    Instant createdAt,
    Instant updatedAt
) {
    public static SecretResult from(SecretEntity entity) {
        return new SecretResult(
            entity.getId().id(),
            entity.getKey(),
            entity.getDescription(),
            entity.getApplicationId(),
            entity.getEnvironmentId(),
            entity.getExternalProvider(),
            entity.getExternalSecretName(),
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
