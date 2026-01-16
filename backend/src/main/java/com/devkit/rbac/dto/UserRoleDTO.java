package com.devkit.rbac.dto;

import java.time.Instant;

/**
 * DTO for user role responses.
 */
public record UserRoleDTO(

    Long id,

    Long tenantId,

    String userId,

    RoleDTO role,

    String grantedBy,

    Instant grantedAt,

    Instant expiresAt,

    String reason,

    Boolean isExpired,

    Boolean isValid

) {
}
