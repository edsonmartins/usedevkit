package com.devkit.configurations.domain.events;

import java.time.LocalDateTime;

/**
 * Domain event published when a configuration is updated.
 */
public record ConfigurationUpdatedEvent(
    String configurationId,
    String key,
    String environmentId,
    Integer newVersion,
    LocalDateTime occurredOn
) {
    public ConfigurationUpdatedEvent {
        occurredOn = LocalDateTime.now();
    }

    public ConfigurationUpdatedEvent(String configurationId, String key, String environmentId, Integer newVersion) {
        this(configurationId, key, environmentId, newVersion, LocalDateTime.now());
    }
}
