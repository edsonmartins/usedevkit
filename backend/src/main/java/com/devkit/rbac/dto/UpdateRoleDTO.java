package com.devkit.rbac.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.List;

/**
 * DTO for updating a role.
 */
public record UpdateRoleDTO(

    @NotBlank(message = "Name is required")
    String name,

    String description,

    List<Long> permissionIds

) {
}
