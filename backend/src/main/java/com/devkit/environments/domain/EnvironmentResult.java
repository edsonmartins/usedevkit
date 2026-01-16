package com.devkit.environments.domain;

import java.time.Instant;

/**
 * Result DTO for environment queries.
 */
public record EnvironmentResult(
    String id,
    String name,
    String description,
    String applicationId,
    String color,
    String inheritFromId,
    Instant createdAt,
    Instant updatedAt
) {
    public static EnvironmentResult from(EnvironmentEntity entity) {
        return new EnvironmentResult(
            entity.getId().id(),
            entity.getName(),
            entity.getDescription(),
            entity.getApplicationId(),
            entity.getColor(),
            entity.getInheritFromId(),
            entity.getCreatedAt(),
            entity.getUpdatedAt()
        );
    }
}
