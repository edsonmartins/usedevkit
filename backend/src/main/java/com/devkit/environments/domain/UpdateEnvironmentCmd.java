package com.devkit.environments.domain;

/**
 * Command to update an existing environment.
 */
public record UpdateEnvironmentCmd(
    String environmentId,
    String description,
    String color,
    String inheritFromId
) {
    public UpdateEnvironmentCmd {
        if (environmentId == null || environmentId.isBlank()) {
            throw new IllegalArgumentException("Environment ID cannot be null or empty");
        }
    }
}
