package com.devkit.configurations.rest;

import com.devkit.configurations.domain.ConfigurationEntity.ConfigType;
import jakarta.validation.constraints.NotBlank;

/**
 * REST Request to update a configuration.
 */
public record UpdateConfigurationRequest(
    String value,

    ConfigType type,

    String description,

    Boolean isSecret
) {
}
