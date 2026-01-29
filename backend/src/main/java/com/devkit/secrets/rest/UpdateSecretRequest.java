package com.devkit.secrets.rest;

import com.devkit.secrets.domain.SecretEntity.ExternalProvider;
import com.devkit.secrets.domain.SecretEntity.RotationPolicy;

/**
 * REST Request to update a secret.
 * The value will be encrypted server-side using the application's encryption key.
 */
public record UpdateSecretRequest(
    String value,
    String description,
    RotationPolicy rotationPolicy,
    String applicationId,
    String environmentId,
    ExternalProvider externalProvider,
    String externalSecretName
) {
}
