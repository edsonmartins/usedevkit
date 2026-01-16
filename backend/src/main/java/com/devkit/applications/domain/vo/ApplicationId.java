package com.devkit.applications.domain.vo;

import com.devkit.shared.domain.IdGenerator;

/**
 * Value Object representing the unique identifier of an Application.
 */
public record ApplicationId(String id) {

    public ApplicationId {
        if (id == null || id.trim().isBlank()) {
            throw new IllegalArgumentException("Application id cannot be null or empty");
        }
    }

    /**
     * Creates an ApplicationId from an existing string.
     * @param id the id string
     * @return ApplicationId instance
     */
    public static ApplicationId of(String id) {
        return new ApplicationId(id);
    }

    /**
     * Generates a new ApplicationId.
     * @return a new ApplicationId
     */
    public static ApplicationId generate() {
        return new ApplicationId(IdGenerator.generateString());
    }
}
