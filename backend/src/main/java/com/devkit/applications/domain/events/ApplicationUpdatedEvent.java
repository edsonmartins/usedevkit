package com.devkit.applications.domain.events;

/**
 * Domain event published when an Application is updated.
 */
public record ApplicationUpdatedEvent(
    String applicationId,
    String name
) {
}
