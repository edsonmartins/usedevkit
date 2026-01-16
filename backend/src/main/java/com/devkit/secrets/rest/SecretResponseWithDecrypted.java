package com.devkit.secrets.rest;

import com.devkit.secrets.domain.SecretEntity.RotationPolicy;
import com.devkit.secrets.domain.SecretResultWithDecrypted;

import java.time.Instant;

/**
 * REST Response for secret data with decrypted value.
 */
public record SecretResponseWithDecrypted(
    String id,
    String key,
    String decryptedValue,
    String description,
    String applicationId,
    String environmentId,
    RotationPolicy rotationPolicy,
    Instant lastRotationDate,
    Instant nextRotationDate,
    Boolean isActive,
    Integer versionNumber,
    Instant createdAt,
    Instant updatedAt
) {
    public static SecretResponseWithDecrypted from(SecretResultWithDecrypted result) {
        return new SecretResponseWithDecrypted(
            result.id(),
            result.key(),
            result.decryptedValue(),
            result.description(),
            result.applicationId(),
            result.environmentId(),
            result.rotationPolicy(),
            result.lastRotationDate(),
            result.nextRotationDate(),
            result.isActive(),
            result.versionNumber(),
            result.createdAt(),
            result.updatedAt()
        );
    }
}
