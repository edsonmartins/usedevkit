package com.devkit.secrets.domain.events;

/**
 * Domain event published when a secret rotation fails.
 */
public record SecretRotationFailedEvent(
    String secretId,
    String key,
    String rotatedBy,
    Integer version,
    String applicationId,
    String environmentId,
    String errorMessage
) {
}
