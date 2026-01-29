package com.devkit.rbac.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.List;

/**
 * DTO for creating a custom role.
 */
public record CreateRoleDTO(

    @NotBlank(message = "Name is required")
    String name,

    String description,

    Long tenantId,

    List<Long> permissionIds

) {
}
