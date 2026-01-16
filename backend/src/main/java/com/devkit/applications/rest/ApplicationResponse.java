package com.devkit.applications.rest;

import com.devkit.applications.domain.ApplicationResult;

import java.time.Instant;

/**
 * Response DTO for Application operations.
 */
public record ApplicationResponse(
    String id,
    String name,
    String description,
    String ownerEmail,
    Boolean isActive,
    Instant createdAt,
    Instant updatedAt
) {
    public static ApplicationResponse from(ApplicationResult result) {
        return new ApplicationResponse(
            result.id(),
            result.name(),
            result.description(),
            result.ownerEmail(),
            result.isActive(),
            result.createdAt(),
            result.updatedAt()
        );
    }
}
