package com.devkit.rbac.dto;

import java.time.Instant;

/**
 * DTO for tenant user responses.
 */
public record TenantUserDTO(

    Long id,

    Long tenantId,

    String userId,

    String email,

    String name,

    String role,

    Boolean isActive,

    Instant joinedAt,

    Instant invitedAt,

    Instant lastActiveAt

) {
}
