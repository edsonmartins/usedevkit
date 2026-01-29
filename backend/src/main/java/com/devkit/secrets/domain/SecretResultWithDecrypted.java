package com.devkit.secrets.domain;

import com.devkit.secrets.domain.SecretEntity.RotationPolicy;

import java.time.Instant;

/**
 * Result DTO for secret queries with decrypted value.
 */
public record SecretResultWithDecrypted(
    String id,
    String key,
    String decryptedValue,
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
    public static SecretResultWithDecrypted from(SecretEntity entity, String decryptedValue) {
        return new SecretResultWithDecrypted(
            entity.getId().id(),
            entity.getKey(),
            decryptedValue,
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
