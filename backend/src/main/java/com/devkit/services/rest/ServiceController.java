package com.devkit.services.rest;

import com.devkit.services.domain.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Map;

/**
 * REST Controller for Service Catalog.
 */
@RestController
@RequestMapping("/api/v1/services")
@Tag(name = "Service Catalog", description = "Service catalog and dependency management APIs")
public class ServiceController {

    private final ServiceRegistry serviceRegistry;

    ServiceController(ServiceRegistry serviceRegistry) {
        this.serviceRegistry = serviceRegistry;
    }

    // ==================== Service CRUD ====================

    @PostMapping
    @Operation(summary = "Register a new service", description = "Registers a new service in the catalog")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Service registered successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input or service already exists")
    })
    ResponseEntity<ServiceResponse> registerService(@Valid @RequestBody CreateServiceRequest request) {
        ServiceEntity service = ServiceEntity.create(
            request.name(),
            request.version(),
            request.description(),
            request.repositoryUrl(),
            request.documentationUrl(),
            request.type(),
            request.owner(),
            request.team(),
            request.language(),
            request.environment(),
            request.port()
        );

        String serviceId = serviceRegistry.registerService(service);
        ServiceEntity created = serviceRegistry.getService(serviceId);

        return ResponseEntity
            .created(URI.create("/api/v1/services/" + serviceId))
            .body(ServiceResponse.from(created));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get service by ID", description = "Retrieves a service by its ID with dependencies")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Service retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Service not found")
    })
    ResponseEntity<ServiceResponse> getService(@PathVariable String id) {
        ServiceEntity service = serviceRegistry.getService(id);
        return ResponseEntity.ok(ServiceResponse.from(service));
    }

    @GetMapping
    @Operation(summary = "Get all services", description = "Retrieves all services in the catalog")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Services retrieved successfully")
    })
    ResponseEntity<List<ServiceResponse>> getAllServices(
            @RequestParam(required = false) String environment,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String team) {

        List<ServiceEntity> services;

        if (environment != null) {
            services = serviceRegistry.getServicesByEnvironment(environment);
        } else if (type != null) {
            services = serviceRegistry.getServicesByType(ServiceEntity.ServiceType.valueOf(type.toUpperCase()));
        } else if (team != null) {
            services = serviceRegistry.getServicesByTeam(team);
        } else {
            services = serviceRegistry.getActiveServices();
        }

        List<ServiceResponse> responses = services.stream()
            .map(ServiceResponse::from)
            .toList();

        return ResponseEntity.ok(responses);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Deactivate a service", description = "Deactivates a service from the catalog")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Service deactivated successfully"),
        @ApiResponse(responseCode = "404", description = "Service not found")
    })
    ResponseEntity<Void> deactivateService(@PathVariable String id) {
        serviceRegistry.deactivateService(id);
        return ResponseEntity.noContent().build();
    }

    // ==================== Health Management ====================

    @GetMapping("/health/stats")
    @Operation(summary = "Get health statistics", description = "Retrieves overall health statistics")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Statistics retrieved successfully")
    })
    ResponseEntity<ServiceRegistry.HealthStatistics> getHealthStatistics() {
        ServiceRegistry.HealthStatistics stats = serviceRegistry.getHealthStatistics();
        return ResponseEntity.ok(stats);
    }

    @PostMapping("/health/check-all")
    @Operation(summary = "Perform health checks on all services", description = "Checks health of all services with health check URL")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Health checks completed")
    })
    ResponseEntity<Map<String, ServiceEntity.ServiceStatus>> performHealthChecks() {
        Map<String, ServiceEntity.ServiceStatus> healthStatus = serviceRegistry.performHealthChecks();
        return ResponseEntity.ok(healthStatus);
    }

    @PostMapping("/{id}/health/check")
    @Operation(summary = "Check health of a specific service", description = "Performs health check on a service")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Health check completed"),
        @ApiResponse(responseCode = "404", description = "Service not found")
    })
    ResponseEntity<ServiceEntity.ServiceStatus> checkServiceHealth(@PathVariable String id) {
        ServiceEntity.ServiceStatus status = serviceRegistry.checkServiceHealth(id);
        return ResponseEntity.ok(status);
    }

    // ==================== Dependency Management ====================

    @PostMapping("/{sourceId}/dependencies/{targetId}")
    @Operation(summary = "Add dependency", description = "Adds a dependency between two services")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Dependency added successfully"),
        @ApiResponse(responseCode = "404", description = "Service not found")
    })
    ResponseEntity<Void> addDependency(
            @PathVariable String sourceId,
            @PathVariable String targetId,
            @RequestBody AddDependencyRequest request) {

        serviceRegistry.addDependency(sourceId, targetId, request.type());
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @DeleteMapping("/{sourceId}/dependencies/{targetId}")
    @Operation(summary = "Remove dependency", description = "Removes a dependency between two services")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Dependency removed successfully"),
        @ApiResponse(responseCode = "404", description = "Service not found")
    })
    ResponseEntity<Void> removeDependency(
            @PathVariable String sourceId,
            @PathVariable String targetId) {

        serviceRegistry.removeDependency(sourceId, targetId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/dependency-graph")
    @Operation(summary = "Get dependency graph", description = "Retrieves the complete dependency graph")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Dependency graph retrieved successfully")
    })
    ResponseEntity<Map<String, List<ServiceRegistry.DependencyNode>>> getDependencyGraph() {
        Map<String, List<ServiceRegistry.DependencyNode>> graph = serviceRegistry.getDependencyGraph();
        return ResponseEntity.ok(graph);
    }

    @GetMapping("/{id}/dependents")
    @Operation(summary = "Get service dependents", description = "Retrieves services that depend on this service")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Dependents retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Service not found")
    })
    ResponseEntity<List<ServiceResponse>> getDependents(@PathVariable String id) {
        List<ServiceEntity> dependents = serviceRegistry.getDependents(id);
        List<ServiceResponse> responses = dependents.stream()
            .map(ServiceResponse::from)
            .toList();
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/dependencies/circular")
    @Operation(summary = "Detect circular dependencies", description = "Detects circular dependencies in the service graph")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Circular dependencies detected")
    })
    ResponseEntity<List<ServiceRegistry.CircularDependency>> detectCircularDependencies() {
        List<ServiceRegistry.CircularDependency> circularDeps =
            serviceRegistry.detectCircularDependencies();
        return ResponseEntity.ok(circularDeps);
    }

    // ==================== Search ====================

    @GetMapping("/search")
    @Operation(summary = "Search services", description = "Searches services by name or description")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Search completed successfully")
    })
    ResponseEntity<List<ServiceResponse>> searchServices(@RequestParam String query) {
        List<ServiceEntity> services = serviceRegistry.searchServices(query);
        List<ServiceResponse> responses = services.stream()
            .map(ServiceResponse::from)
            .toList();
        return ResponseEntity.ok(responses);
    }
}
