package com.devkit.sdk.model;

import java.time.Instant;
import java.time.LocalDateTime;

/**
 * Represents a secret (encrypted value).
 */
public record Secret(
    String id,
    String key,
    String decryptedValue,
    String description,
    String applicationId,
    String environmentId,
    String rotationPolicy,
    Instant lastRotationDate,
    Instant nextRotationDate,
    Boolean isActive,
    Integer versionNumber,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
}
