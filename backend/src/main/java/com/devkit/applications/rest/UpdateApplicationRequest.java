package com.devkit.applications.rest;

import jakarta.validation.constraints.Size;

/**
 * Request DTO for updating an Application.
 */
public record UpdateApplicationRequest(

    @Size(min = 3, max = 100, message = "Application name must be between 3 and 100 characters")
    String name,

    @Size(max = 500, message = "Description cannot exceed 500 characters")
    String description
) {
}
