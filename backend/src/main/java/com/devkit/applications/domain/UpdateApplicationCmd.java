package com.devkit.applications.domain;

/**
 * Command for updating an existing Application.
 */
public record UpdateApplicationCmd(
    String applicationId,
    String name,
    String description
) {
    public UpdateApplicationCmd {
        if (applicationId == null || applicationId.trim().isBlank()) {
            throw new IllegalArgumentException("Application id cannot be null or empty");
        }
    }
}
