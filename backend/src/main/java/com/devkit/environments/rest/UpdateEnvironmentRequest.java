package com.devkit.environments.rest;

/**
 * REST Request to update an environment.
 */
public record UpdateEnvironmentRequest(
    String description,
    String color,
    String inheritFromId
) {
}
