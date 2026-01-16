package com.devkit.services.rest;

import com.devkit.services.domain.ServiceEntity;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;

/**
 * Response DTO for Service.
 */
public record ServiceResponse(
    String id,
    String name,
    String version,
    String description,
    String repositoryUrl,
    String documentationUrl,
    String type,
    String status,
    String owner,
    String team,
    String language,
    String environment,
    Integer port,
    String healthCheckUrl,
    Instant lastHealthCheck,
    Boolean isActive
) {
    static ServiceResponse from(ServiceEntity entity) {
        return new ServiceResponse(
            entity.getId().id(),
            entity.getName(),
            entity.getVersion(),
            entity.getDescription(),
            entity.getRepositoryUrl(),
            entity.getDocumentationUrl(),
            entity.getType().name(),
            entity.getStatus().name(),
            entity.getOwner(),
            entity.getTeam(),
            entity.getLanguage(),
            entity.getEnvironment(),
            entity.getPort(),
            entity.getHealthCheckUrl(),
            entity.getLastHealthCheck(),
            entity.isActive()
        );
    }
}

/**
 * Request DTO for creating a service.
 */
record CreateServiceRequest(
    @NotBlank(message = "Service name is required")
    String name,

    @NotBlank(message = "Service version is required")
    String version,

    String description,
    String repositoryUrl,
    String documentationUrl,

    @NotNull(message = "Service type is required")
    ServiceEntity.ServiceType type,

    String owner,
    String team,
    String language,
    String environment,

    @NotNull(message = "Service port is required")
    Integer port
) {}

/**
 * Request DTO for adding a dependency.
 */
record AddDependencyRequest(
    @NotBlank(message = "Dependency type is required")
    String type
) {}
