package com.devkit.environments.domain;

/**
 * Command to create a new environment.
 */
public record CreateEnvironmentCmd(
    String name,
    String description,
    String applicationId,
    String color,
    String inheritFromId
) {
    public CreateEnvironmentCmd {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Environment name cannot be null or empty");
        }
        if (applicationId == null || applicationId.isBlank()) {
            throw new IllegalArgumentException("Application ID cannot be null or empty");
        }
    }
}
