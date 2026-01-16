package com.devkit.environments.rest;

import com.devkit.environments.domain.EnvironmentResult;

import java.time.Instant;

/**
 * REST Response for environment data.
 */
public record EnvironmentResponse(
    String id,
    String name,
    String description,
    String applicationId,
    String color,
    String inheritFromId,
    Instant createdAt,
    Instant updatedAt
) {
    public static EnvironmentResponse from(EnvironmentResult result) {
        return new EnvironmentResponse(
            result.id(),
            result.name(),
            result.description(),
            result.applicationId(),
            result.color(),
            result.inheritFromId(),
            result.createdAt(),
            result.updatedAt()
        );
    }
}
