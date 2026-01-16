package com.devkit.secrets.rest;

import com.devkit.secrets.domain.SecretEntity.RotationPolicy;

/**
 * REST Request to update a secret.
 */
public record UpdateSecretRequest(
    String encryptedValue,
    String description,
    RotationPolicy rotationPolicy,
    String applicationId,
    String environmentId
) {
}
