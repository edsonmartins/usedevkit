package com.devkit.applications.domain.events;

/**
 * Domain event published when an Application is activated.
 */
public record ApplicationActivatedEvent(
    String applicationId,
    String name
) {
}
