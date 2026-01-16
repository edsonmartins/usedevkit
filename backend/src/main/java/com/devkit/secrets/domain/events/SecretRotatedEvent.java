package com.devkit.secrets.domain.events;

import java.time.LocalDateTime;

/**
 * Domain event published when a secret is rotated.
 */
public record SecretRotatedEvent(
    String secretId,
    String key,
    String rotatedBy,
    Integer newVersion,
    String applicationId,
    String environmentId,
    LocalDateTime occurredOn
) {
    public SecretRotatedEvent {
        occurredOn = LocalDateTime.now();
    }

    public SecretRotatedEvent(String secretId, String key, String rotatedBy, Integer newVersion, String applicationId, String environmentId) {
        this(secretId, key, rotatedBy, newVersion, applicationId, environmentId, LocalDateTime.now());
    }
}
