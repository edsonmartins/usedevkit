package com.devkit.configurations.domain.events;

import java.time.LocalDateTime;

/**
 * Domain event published when a configuration is created.
 */
public record ConfigurationCreatedEvent(
    String configurationId,
    String key,
    String environmentId,
    LocalDateTime occurredOn
) {
    public ConfigurationCreatedEvent {
        occurredOn = LocalDateTime.now();
    }

    public ConfigurationCreatedEvent(String configurationId, String key, String environmentId) {
        this(configurationId, key, environmentId, LocalDateTime.now());
    }
}
