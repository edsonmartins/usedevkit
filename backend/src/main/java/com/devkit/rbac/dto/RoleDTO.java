package com.devkit.rbac.dto;

import java.time.Instant;
import java.util.List;

/**
 * DTO for role responses.
 */
public record RoleDTO(

    Long id,

    String name,

    String description,

    Boolean isSystemRole,

    Long tenantId,

    List<PermissionDTO> permissions,

    Integer permissionCount,

    Instant createdAt,

    Instant updatedAt

) {
}
