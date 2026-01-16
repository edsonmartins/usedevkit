package com.devkit.secrets.rest;

import jakarta.validation.constraints.NotBlank;

/**
 * REST Request to rotate a secret.
 */
public record RotateSecretRequest(
    @NotBlank(message = "New encrypted value is required")
    String newEncryptedValue,

    @NotBlank(message = "Rotated by is required")
    String rotatedBy
) {
}
