package com.devkit.secrets.domain;

import com.devkit.secrets.domain.SecretEntity.RotationPolicy;

/**
 * Command to create a new secret.
 * The value will be encrypted using the application's encryption key.
 */
public record CreateSecretCmd(
    String key,
    String value,
    String description,
    String applicationId,
    String environmentId,
    SecretEntity.ExternalProvider externalProvider,
    String externalSecretName,
    RotationPolicy rotationPolicy
) {
    public CreateSecretCmd {
        if (key == null || key.isBlank()) {
            throw new IllegalArgumentException("Secret key cannot be null or empty");
        }
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Secret value cannot be null or empty");
        }
        if (applicationId == null || applicationId.isBlank()) {
            throw new IllegalArgumentException("Application ID cannot be null or empty");
        }
        if (rotationPolicy == null) {
            rotationPolicy = RotationPolicy.MANUAL;
        }
    }
}
