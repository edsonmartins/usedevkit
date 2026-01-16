package com.devkit.secrets.domain.events;

import java.time.LocalDateTime;

/**
 * Domain event published when a secret is deactivated.
 */
public record SecretDeactivatedEvent(
    String secretId,
    String key,
    String applicationId,
    String environmentId,
    LocalDateTime occurredOn
) {
    public SecretDeactivatedEvent {
        occurredOn = LocalDateTime.now();
    }

    public SecretDeactivatedEvent(String secretId, String key, String applicationId, String environmentId) {
        this(secretId, key, applicationId, environmentId, LocalDateTime.now());
    }
}
