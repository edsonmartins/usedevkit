package com.devkit.rbac.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * DTO for creating a custom permission.
 */
public record CreatePermissionDTO(

    @NotBlank(message = "Name is required")
    String name,

    @NotBlank(message = "Display name is required")
    String displayName,

    String description,

    @NotBlank(message = "Resource is required")
    String resource,

    @NotBlank(message = "Action is required")
    String action

) {
}
