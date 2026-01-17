package com.devkit.applications.domain.vo;

import com.devkit.shared.domain.IdGenerator;

/**
 * Value Object representing the unique identifier of an Application Encryption Key.
 */
public record ApplicationKeyId(String id) {

    public ApplicationKeyId {
        if (id == null || id.trim().isBlank()) {
            throw new IllegalArgumentException("Application key id cannot be null or empty");
        }
    }

    /**
     * Creates an ApplicationKeyId from an existing string.
     * @param id the id string
     * @return ApplicationKeyId instance
     */
    public static ApplicationKeyId of(String id) {
        return new ApplicationKeyId(id);
    }

    /**
     * Generates a new ApplicationKeyId.
     * @return a new ApplicationKeyId
     */
    public static ApplicationKeyId generate() {
        return new ApplicationKeyId(IdGenerator.generateString());
    }
}
