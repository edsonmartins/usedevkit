package com.devkit.configurations.rest;

import com.devkit.configurations.domain.ConfigurationEntity.ConfigType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * REST Request to create a new configuration.
 */
public record CreateConfigurationRequest(
    @NotBlank(message = "Configuration key is required")
    String key,

    @NotBlank(message = "Configuration value is required")
    String value,

    @NotNull(message = "Configuration type is required")
    ConfigType type,

    String description,

    Boolean isSecret,

    @NotBlank(message = "Environment ID is required")
    String environmentId
) {
    public CreateConfigurationRequest {
        if (isSecret == null) {
            isSecret = false;
        }
    }
}
