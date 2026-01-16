package com.devkit.rbac.dto;

import java.time.Instant;

/**
 * DTO for permission responses.
 */
public record PermissionDTO(

    Long id,

    String name,

    String displayName,

    String description,

    String resource,

    String action,

    Boolean isSystem,

    Instant createdAt

) {
}
