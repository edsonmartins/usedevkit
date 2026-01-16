package com.devkit.configurations.domain;

import com.devkit.configurations.domain.ConfigurationEntity.ConfigType;

import java.time.LocalDateTime;

/**
 * Result DTO for configuration queries.
 */
public record ConfigurationResult(
    String id,
    String key,
    String value,
    ConfigType type,
    String description,
    Boolean isSecret,
    String environmentId,
    Integer versionNumber,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {
    public static ConfigurationResult from(ConfigurationEntity entity) {
        return new ConfigurationResult(
            entity.getId().id(),
            entity.getKey(),
            entity.getValue(),
            entity.getType(),
            entity.getDescription(),
            entity.isSecret(),
            entity.getEnvironmentId(),
            entity.getVersionNumber(),
            entity.getCreatedAt(),
            entity.getUpdatedAt()
        );
    }
}
