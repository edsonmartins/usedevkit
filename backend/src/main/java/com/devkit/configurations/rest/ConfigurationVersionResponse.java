package com.devkit.configurations.rest;

import com.devkit.configurations.domain.ConfigurationVersionEntity;

import java.time.Instant;

/**
 * Response DTO for configuration version.
 */
public record ConfigurationVersionResponse(
    String id,
    String key,
    String value,
    String type,
    String description,
    int versionNumber,
    Instant createdAt
) {
    static ConfigurationVersionResponse fromEntity(ConfigurationVersionEntity entity) {
        return new ConfigurationVersionResponse(
            entity.getId(),
            entity.getConfiguration().getKey(),
            entity.getValue(),
            entity.getConfiguration().getType().name(),
            entity.getConfiguration().getDescription(),
            entity.getVersionNumber(),
            entity.getCreatedAt()
        );
    }
}
