package com.devkit.secrets.domain;

import com.devkit.secrets.domain.SecretEntity.RotationPolicy;

/**
 * Command to update an existing secret.
 */
public record UpdateSecretCmd(
    String secretId,
    String encryptedValue,
    String description,
    RotationPolicy rotationPolicy
) {
    public UpdateSecretCmd {
        if (secretId == null || secretId.isBlank()) {
            throw new IllegalArgumentException("Secret ID cannot be null or empty");
        }
    }
}
