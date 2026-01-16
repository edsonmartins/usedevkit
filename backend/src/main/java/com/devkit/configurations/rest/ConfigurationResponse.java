package com.devkit.configurations.rest;

import com.devkit.configurations.domain.ConfigurationEntity.ConfigType;
import com.devkit.configurations.domain.ConfigurationResult;

import java.time.Instant;

/**
 * REST Response for configuration data.
 */
public record ConfigurationResponse(
    String id,
    String key,
    String value,
    ConfigType type,
    String description,
    Boolean isSecret,
    String environmentId,
    Integer versionNumber,
    Instant createdAt,
    Instant updatedAt
) {
    public static ConfigurationResponse from(ConfigurationResult result) {
        return new ConfigurationResponse(
            result.id(),
            result.key(),
            result.value(),
            result.type(),
            result.description(),
            result.isSecret(),
            result.environmentId(),
            result.versionNumber(),
            result.createdAt(),
            result.updatedAt()
        );
    }
}
