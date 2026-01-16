package com.devkit.applications.domain;

/**
 * Command for creating a new Application.
 */
public record CreateApplicationCmd(
    String name,
    String description,
    String ownerEmail
) {
    public CreateApplicationCmd {
        if (name == null || name.trim().isBlank()) {
            throw new IllegalArgumentException("Application name cannot be null or empty");
        }
        if (ownerEmail == null || ownerEmail.trim().isBlank()) {
            throw new IllegalArgumentException("Owner email cannot be null or empty");
        }
    }
}
