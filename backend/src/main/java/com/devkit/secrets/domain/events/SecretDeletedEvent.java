package com.devkit.secrets.domain.events;

import java.time.LocalDateTime;

/**
 * Domain event published when a secret is deleted.
 */
public record SecretDeletedEvent(
    String secretId,
    String key,
    String applicationId,
    String environmentId,
    LocalDateTime occurredOn
) {
    public SecretDeletedEvent {
        occurredOn = LocalDateTime.now();
    }

    public SecretDeletedEvent(String secretId, String key, String applicationId, String environmentId) {
        this(secretId, key, applicationId, environmentId, LocalDateTime.now());
    }
}
