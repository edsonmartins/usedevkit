package com.devkit.sdk.model;

import java.time.LocalDateTime;

/**
 * Represents a configuration value.
 */
public record Configuration(
    String id,
    String key,
    String value,
    String type,
    String description,
    String environmentId,
    Integer versionNumber,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
}
