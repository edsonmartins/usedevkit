package com.devkit.secrets.rest;

import com.devkit.secrets.domain.SecretEntity.ExternalProvider;
import com.devkit.secrets.domain.SecretEntity.RotationPolicy;
import jakarta.validation.constraints.NotBlank;

/**
 * REST Request to create a new secret.
 * The value will be encrypted server-side using the application's encryption key.
 */
public record CreateSecretRequest(
    @NotBlank(message = "Secret key is required")
    String key,

    @NotBlank(message = "Secret value is required")
    String value,

    String description,

    @NotBlank(message = "Application ID is required")
    String applicationId,

    String environmentId,

    ExternalProvider externalProvider,

    String externalSecretName,

    RotationPolicy rotationPolicy
) {
    public CreateSecretRequest {
        if (rotationPolicy == null) {
            rotationPolicy = RotationPolicy.MANUAL;
        }
    }
}
