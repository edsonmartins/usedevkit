package com.devkit.secrets.domain.vo;

import com.devkit.shared.domain.IdGenerator;

/**
 * Value Object representing the unique identifier of a Secret.
 */
public record SecretId(String id) {

    public SecretId {
        if (id == null || id.trim().isBlank()) {
            throw new IllegalArgumentException("Secret id cannot be null or empty");
        }
    }

    public static SecretId of(String id) {
        return new SecretId(id);
    }

    public static SecretId generate() {
        return new SecretId(IdGenerator.generateString());
    }
}
