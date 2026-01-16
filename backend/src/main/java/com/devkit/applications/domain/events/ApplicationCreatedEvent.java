package com.devkit.applications.domain.events;

/**
 * Domain event published when a new Application is created.
 */
public record ApplicationCreatedEvent(
    String applicationId,
    String name,
    String ownerEmail
) {
}
