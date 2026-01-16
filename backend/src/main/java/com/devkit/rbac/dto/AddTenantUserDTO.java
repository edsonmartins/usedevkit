package com.devkit.rbac.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * DTO for adding a user to a tenant.
 */
public record AddTenantUserDTO(

    @NotBlank(message = "User ID is required")
    String userId,

    @Email(message = "Invalid email format")
    String email,

    String name,

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
