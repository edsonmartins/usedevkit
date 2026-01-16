package com.devkit.secrets.domain;

import com.devkit.secrets.domain.SecretEntity.RotationPolicy;

/**
 * Command to create a new secret.
 */
public record CreateSecretCmd(
    String key,
    String encryptedValue,
    String description,
    String applicationId,
    String environmentId,
    RotationPolicy rotationPolicy
) {
    public CreateSecretCmd {
        if (key == null || key.isBlank()) {
            throw new IllegalArgumentException("Secret key cannot be null or empty");
        }
        if (encryptedValue == null || encryptedValue.isBlank()) {
            throw new IllegalArgumentException("Secret encrypted value cannot be null or empty");
        }
        if (applicationId == null || applicationId.isBlank()) {
            throw new IllegalArgumentException("Application ID cannot be null or empty");
        }
        if (rotationPolicy == null) {
            rotationPolicy = RotationPolicy.MANUAL;
        }
    }
}
