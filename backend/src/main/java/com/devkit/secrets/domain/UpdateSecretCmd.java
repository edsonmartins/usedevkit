package com.devkit.secrets.domain;

import com.devkit.secrets.domain.SecretEntity.RotationPolicy;

/**
 * Command to update an existing secret.
 * The value will be encrypted using the application's encryption key.
 */
public record UpdateSecretCmd(
    String secretId,
    String value,
    String description,
    RotationPolicy rotationPolicy,
    String applicationId,
    String environmentId,
    SecretEntity.ExternalProvider externalProvider,
    String externalSecretName
) {
    public UpdateSecretCmd {
        if (secretId == null || secretId.isBlank()) {
            throw new IllegalArgumentException("Secret ID cannot be null or empty");
        }
        if (value != null && value.isBlank()) {
            throw new IllegalArgumentException("Secret value cannot be blank");
        }
    }
}
