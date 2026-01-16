package com.devkit.environments.domain.vo;

import com.devkit.shared.domain.IdGenerator;

/**
 * Value Object representing the unique identifier of an Environment.
 */
public record EnvironmentId(String id) {

    public EnvironmentId {
        if (id == null || id.trim().isBlank()) {
            throw new IllegalArgumentException("Environment id cannot be null or empty");
        }
    }

    public static EnvironmentId of(String id) {
        return new EnvironmentId(id);
    }

    public static EnvironmentId generate() {
        return new EnvironmentId(IdGenerator.generateString());
    }
}
