package com.devkit.secrets.domain;

/**
 * Command to rotate a secret.
 */
public record RotateSecretCmd(
    String secretId,
    String newEncryptedValue,
    String rotatedBy
) {
    public RotateSecretCmd {
        if (secretId == null || secretId.isBlank()) {
            throw new IllegalArgumentException("Secret ID cannot be null or empty");
        }
        if (newEncryptedValue == null || newEncryptedValue.isBlank()) {
            throw new IllegalArgumentException("New encrypted value cannot be null or empty");
        }
        if (rotatedBy == null || rotatedBy.isBlank()) {
            throw new IllegalArgumentException("Rotated by cannot be null or empty");
        }
    }
}
