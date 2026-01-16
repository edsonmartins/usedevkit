package com.devkit.environments.domain.events;

import java.time.LocalDateTime;

/**
 * Domain event published when an environment is created.
 */
public record EnvironmentCreatedEvent(
    String environmentId,
    String name,
    String applicationId,
    LocalDateTime occurredOn
) {
    public EnvironmentCreatedEvent {
        occurredOn = LocalDateTime.now();
    }

    public EnvironmentCreatedEvent(String environmentId, String name, String applicationId) {
        this(environmentId, name, applicationId, LocalDateTime.now());
    }
}
