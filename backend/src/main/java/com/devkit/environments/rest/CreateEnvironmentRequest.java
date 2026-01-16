package com.devkit.environments.rest;

import jakarta.validation.constraints.NotBlank;

/**
 * REST Request to create a new environment.
 */
public record CreateEnvironmentRequest(
    @NotBlank(message = "Environment name is required")
    String name,

    String description,

    @NotBlank(message = "Application ID is required")
    String applicationId,

    String color,

    String inheritFromId
) {
}
