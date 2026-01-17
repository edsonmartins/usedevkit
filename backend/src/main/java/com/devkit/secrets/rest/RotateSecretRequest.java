package com.devkit.secrets.rest;

import jakarta.validation.constraints.NotBlank;

/**
 * REST Request to rotate a secret.
 * The value will be encrypted server-side using the application's encryption key.
 */
public record RotateSecretRequest(
    @NotBlank(message = "New value is required")
    String newValue,

    @NotBlank(message = "Rotated by is required")
    String rotatedBy
) {
}
