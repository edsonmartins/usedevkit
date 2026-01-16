package com.devkit.applications.rest;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Request DTO for creating a new Application.
 */
public record CreateApplicationRequest(

    @NotBlank(message = "Application name is required")
    @Size(min = 3, max = 100, message = "Application name must be between 3 and 100 characters")
    String name,

    @Size(max = 500, message = "Description cannot exceed 500 characters")
    String description,

    @NotBlank(message = "Owner email is required")
    @Email(message = "Owner email must be valid")
    String ownerEmail
) {
}
