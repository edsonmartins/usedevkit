package com.devkit.bootstrap.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Request DTO for initial system bootstrap.
 */
public record BootstrapRequest(
    @NotBlank(message = "Organization name is required")
    @Size(min = 2, max = 100, message = "Organization name must be between 2 and 100 characters")
    String organizationName,

    @NotBlank(message = "Admin email is required")
    @Email(message = "Invalid email format")
    String adminEmail,

    @NotBlank(message = "Application name is required")
    @Size(min = 2, max = 100, message = "Application name must be between 2 and 100 characters")
    String applicationName
) {}
