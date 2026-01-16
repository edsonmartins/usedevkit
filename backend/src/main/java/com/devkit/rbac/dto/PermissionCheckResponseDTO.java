package com.devkit.rbac.dto;

import java.util.Set;

/**
 * DTO for permission check responses.
 */
public record PermissionCheckResponseDTO(

    Boolean hasPermission,

    String userId,

    String resource,

    String action,

    Set<String> userPermissions,

    Integer permissionCount

) {
}
