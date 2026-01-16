package com.devkit.rbac.dto;

import jakarta.validation.constraints.NotNull;

/**
 * DTO for updating a tenant user role.
 */
public record UpdateTenantUserDTO(

    @NotNull(message = "Role is required")
    TenantRoleDTO role

) {
    public enum TenantRoleDTO {
        OWNER,
        ADMIN,
        MEMBER,
        VIEWER
    }
}
