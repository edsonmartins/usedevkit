package com.devkit.applications.domain;

import com.devkit.applications.domain.vo.ApplicationId;

import java.time.Instant;

/**
 * Result object for Application operations.
 */
public record ApplicationResult(
    String id,
    String name,
    String description,
    String ownerEmail,
    Boolean isActive,
    Instant createdAt,
    Instant updatedAt
) {
    public static ApplicationResult from(ApplicationEntity entity) {
        return new ApplicationResult(
            entity.getId().id(),
            entity.getName(),
            entity.getDescription(),
            entity.getOwnerEmail(),
            entity.isActive(),
            entity.getCreatedAt(),
            entity.getUpdatedAt()
        );
    }
}
