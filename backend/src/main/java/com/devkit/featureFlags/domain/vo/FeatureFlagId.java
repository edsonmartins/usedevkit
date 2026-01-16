package com.devkit.featureFlags.domain.vo;

import com.devkit.shared.domain.IdGenerator;

/**
 * Value Object representing the unique identifier of a Feature Flag.
 */
public record FeatureFlagId(String id) {

    public FeatureFlagId {
        if (id == null || id.trim().isBlank()) {
            throw new IllegalArgumentException("Feature flag id cannot be null or empty");
        }
    }

    public static FeatureFlagId of(String id) {
        return new FeatureFlagId(id);
    }

    public static FeatureFlagId generate() {
        return new FeatureFlagId(IdGenerator.generateString());
    }
}
