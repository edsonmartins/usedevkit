package com.devkit.configurations.domain;

import com.devkit.configurations.domain.ConfigurationEntity.ConfigType;

/**
 * Command to create a new configuration.
 */
public record CreateConfigurationCmd(
    String key,
    String value,
    ConfigType type,
    String description,
    Boolean isSecret,
    String environmentId
) {
    public CreateConfigurationCmd {
        if (key == null || key.isBlank()) {
            throw new IllegalArgumentException("Configuration key cannot be null or empty");
        }
        if (value == null) {
            throw new IllegalArgumentException("Configuration value cannot be null");
        }
        if (type == null) {
            throw new IllegalArgumentException("Configuration type cannot be null");
        }
        if (environmentId == null || environmentId.isBlank()) {
            throw new IllegalArgumentException("Environment ID cannot be null or empty");
        }
    }
}
