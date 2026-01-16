package com.devkit.applications.domain.events;

/**
 * Domain event published when an Application is deactivated.
 */
public record ApplicationDeactivatedEvent(
    String applicationId,
    String name
) {
}
