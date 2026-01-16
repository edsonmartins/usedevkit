package com.devkit.environments.rest;

import com.devkit.environments.domain.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

/**
 * REST Controller for Environments.
 */
@RestController
@RequestMapping("/api/v1/environments")
@Tag(name = "Environments", description = "Environment management APIs")
public class EnvironmentController {

    private final EnvironmentCommandService commandService;
    private final EnvironmentQueryService queryService;

    EnvironmentController(
            EnvironmentCommandService commandService,
            EnvironmentQueryService queryService) {
        this.commandService = commandService;
        this.queryService = queryService;
    }

    @PostMapping
    @Operation(summary = "Create a new environment", description = "Creates a new environment with the provided details")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Environment created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input")
    })
    ResponseEntity<EnvironmentResponse> createEnvironment(@Valid @RequestBody CreateEnvironmentRequest request) {
        var cmd = new CreateEnvironmentCmd(
            request.name(),
            request.description(),
            request.applicationId(),
            request.color(),
            request.inheritFromId()
        );

        String environmentId = commandService.createEnvironment(cmd);
        var result = queryService.getEnvironmentById(environmentId);

        return ResponseEntity
            .created(URI.create("/api/v1/environments/" + environmentId))
            .body(EnvironmentResponse.from(result));
    }

    @GetMapping("/application/{applicationId}")
    @Operation(summary = "Get environments by application", description = "Retrieves all environments for an application")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Environments retrieved successfully")
    })
    ResponseEntity<List<EnvironmentResponse>> getEnvironmentsByApplication(@PathVariable String applicationId) {
        var environments = queryService.getEnvironmentsByApplication(applicationId);
        var responses = environments.stream()
            .map(EnvironmentResponse::from)
            .toList();

        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get environment by ID", description = "Retrieves an environment by its ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Environment retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Environment not found")
    })
    ResponseEntity<EnvironmentResponse> getEnvironmentById(@PathVariable String id) {
        var result = queryService.getEnvironmentById(id);
        return ResponseEntity.ok(EnvironmentResponse.from(result));
    }

    @GetMapping("/application/{applicationId}/name/{name}")
    @Operation(summary = "Get environment by application and name", description = "Retrieves an environment by application and name")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Environment retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Environment not found")
    })
    ResponseEntity<EnvironmentResponse> getEnvironmentByApplicationAndName(
            @PathVariable String applicationId,
            @PathVariable String name) {
        var result = queryService.getEnvironmentByApplicationAndName(applicationId, name);
        return ResponseEntity.ok(EnvironmentResponse.from(result));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an environment", description = "Updates an existing environment")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Environment updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input"),
        @ApiResponse(responseCode = "404", description = "Environment not found")
    })
    ResponseEntity<EnvironmentResponse> updateEnvironment(
            @PathVariable String id,
            @Valid @RequestBody UpdateEnvironmentRequest request) {
        var cmd = new UpdateEnvironmentCmd(
            id,
            request.description(),
            request.color(),
            request.inheritFromId()
        );

        commandService.updateEnvironment(cmd);
        var result = queryService.getEnvironmentById(id);

        return ResponseEntity.ok(EnvironmentResponse.from(result));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an environment", description = "Deletes an environment by its ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Environment deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Environment not found")
    })
    ResponseEntity<Void> deleteEnvironment(@PathVariable String id) {
        commandService.deleteEnvironment(id);
        return ResponseEntity.noContent().build();
    }
}
