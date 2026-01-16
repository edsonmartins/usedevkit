package com.devkit.rbac.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;

/**
 * DTO for granting a role to a user.
 */
public record GrantRoleDTO(

    @NotBlank(message = "User ID is required")
    String userId,

    @NotNull(message = "Role ID is required")
    Long roleId,

    @NotBlank(message = "Granted by is required")
    String grantedBy,

    String reason,

    Instant expiresAt

) {
}
