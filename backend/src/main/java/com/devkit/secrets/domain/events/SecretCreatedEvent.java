package com.devkit.secrets.domain.events;

import java.time.LocalDateTime;

/**
 * Domain event published when a secret is created.
 */
public record SecretCreatedEvent(
    String secretId,
    String key,
    String applicationId,
    String environmentId,
    LocalDateTime occurredOn
) {
    public SecretCreatedEvent {
        occurredOn = LocalDateTime.now();
    }

    public SecretCreatedEvent(String secretId, String key, String applicationId, String environmentId) {
        this(secretId, key, applicationId, environmentId, LocalDateTime.now());
    }
}
