package com.devkit.secrets.rest;

import com.devkit.secrets.domain.SecretEntity.RotationPolicy;
import com.devkit.secrets.domain.SecretResult;

import java.time.Instant;

/**
 * REST Response for secret data (without decrypted value).
 */
public record SecretResponse(
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
    Instant createdAt,
    Instant updatedAt
) {
    public static SecretResponse from(SecretResult result) {
        return new SecretResponse(
            result.id(),
            result.key(),
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
