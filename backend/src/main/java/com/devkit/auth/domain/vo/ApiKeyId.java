package com.devkit.auth.domain.vo;

import com.devkit.shared.domain.IdGenerator;

/**
 * Value Object representing the unique identifier of an API Key.
 */
public record ApiKeyId(String id) {

    public ApiKeyId {
        if (id == null || id.trim().isBlank()) {
            throw new IllegalArgumentException("API Key id cannot be null or empty");
        }
    }

    public static ApiKeyId of(String id) {
        return new ApiKeyId(id);
    }

    public static ApiKeyId generate() {
        return new ApiKeyId(IdGenerator.generateString());
    }
}
