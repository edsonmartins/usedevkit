package com.devkit.secrets.domain;

/**
 * Command to rotate a secret.
 * The value will be encrypted using the application's encryption key.
 */
public record RotateSecretCmd(
    String secretId,
    String newValue,
    String rotatedBy
) {
    public RotateSecretCmd {
        if (secretId == null || secretId.isBlank()) {
            throw new IllegalArgumentException("Secret ID cannot be null or empty");
        }
        if (newValue == null || newValue.isBlank()) {
            throw new IllegalArgumentException("New value cannot be null or empty");
        }
        if (rotatedBy == null || rotatedBy.isBlank()) {
            throw new IllegalArgumentException("Rotated by cannot be null or empty");
        }
    }
}
