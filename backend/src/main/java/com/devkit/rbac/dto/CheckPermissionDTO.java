package com.devkit.rbac.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * DTO for checking permissions.
 */
public record CheckPermissionDTO(

    @NotBlank(message = "User ID is required")
    String userId,

    @NotBlank(message = "Resource is required")
    String resource,

    @NotBlank(message = "Action is required")
    String action

) {
}
