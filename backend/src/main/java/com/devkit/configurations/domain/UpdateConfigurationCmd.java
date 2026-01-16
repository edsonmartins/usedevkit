package com.devkit.configurations.domain;

import com.devkit.configurations.domain.ConfigurationEntity.ConfigType;

/**
 * Command to update an existing configuration.
 */
public record UpdateConfigurationCmd(
    String configurationId,
    String value,
    ConfigType type,
    String description,
    Boolean isSecret
) {
    public UpdateConfigurationCmd {
        if (configurationId == null || configurationId.isBlank()) {
            throw new IllegalArgumentException("Configuration ID cannot be null or empty");
        }
    }
}
