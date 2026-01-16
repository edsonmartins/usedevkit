package com.devkit.configurations.domain.events;

import java.time.LocalDateTime;

/**
 * Domain event published when a configuration is deleted.
 */
public record ConfigurationDeletedEvent(
    String configurationId,
    String key,
    String environmentId,
    LocalDateTime occurredOn
) {
    public ConfigurationDeletedEvent {
        occurredOn = LocalDateTime.now();
    }

    public ConfigurationDeletedEvent(String configurationId, String key, String environmentId) {
        this(configurationId, key, environmentId, LocalDateTime.now());
    }
}
