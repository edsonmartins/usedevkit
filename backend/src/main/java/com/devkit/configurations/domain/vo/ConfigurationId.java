package com.devkit.configurations.domain.vo;

import com.devkit.shared.domain.IdGenerator;

/**
 * Value Object representing the unique identifier of a Configuration.
 */
public record ConfigurationId(String id) {

    public ConfigurationId {
        if (id == null || id.trim().isBlank()) {
            throw new IllegalArgumentException("Configuration id cannot be null or empty");
        }
    }

    public static ConfigurationId of(String id) {
        return new ConfigurationId(id);
    }

    public static ConfigurationId generate() {
        return new ConfigurationId(IdGenerator.generateString());
    }
}
