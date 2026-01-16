package com.devkit.applications.domain.events;

/**
 * Domain event published when an Application is deleted.
 */
public record ApplicationDeletedEvent(
    String applicationId,
    String name
) {
}
