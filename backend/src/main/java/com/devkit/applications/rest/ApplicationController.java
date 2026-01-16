package com.devkit.applications.rest;

import com.devkit.applications.domain.*;
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

/**
 * REST Controller for Applications.
 */
@RestController
@RequestMapping("/api/v1/applications")
@Tag(name = "Applications", description = "Application management APIs")
public class ApplicationController {

    private final ApplicationCommandService commandService;
    private final ApplicationQueryService queryService;

    ApplicationController(
            ApplicationCommandService commandService,
            ApplicationQueryService queryService) {
        this.commandService = commandService;
        this.queryService = queryService;
    }

    @PostMapping
    @Operation(summary = "Create a new application", description = "Creates a new application with the provided details")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Application created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input")
    })
    ResponseEntity<ApplicationResponse> createApplication(@Valid @RequestBody CreateApplicationRequest request) {
        var cmd = new CreateApplicationCmd(
            request.name(),
            request.description(),
            request.ownerEmail()
        );

        String applicationId = commandService.createApplication(cmd);
        var result = queryService.getApplicationById(applicationId);

        return ResponseEntity
            .created(URI.create("/api/v1/applications/" + applicationId))
            .body(ApplicationResponse.from(result));
    }

    @GetMapping
    @Operation(summary = "Get all applications", description = "Retrieves all applications")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Applications retrieved successfully")
    })
    ResponseEntity<List<ApplicationResponse>> getAllApplications() {
        var applications = queryService.getAllApplications();
        var responses = applications.stream()
            .map(ApplicationResponse::from)
            .toList();

        return ResponseEntity.ok(responses);
    }

    @GetMapping("/active")
    @Operation(summary = "Get active applications", description = "Retrieves all active applications")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Active applications retrieved successfully")
    })
    ResponseEntity<List<ApplicationResponse>> getActiveApplications() {
        var applications = queryService.getActiveApplications();
        var responses = applications.stream()
            .map(ApplicationResponse::from)
            .toList();

        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get application by ID", description = "Retrieves an application by its ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Application retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Application not found")
    })
    ResponseEntity<ApplicationResponse> getApplicationById(@PathVariable String id) {
        var result = queryService.getApplicationById(id);
        return ResponseEntity.ok(ApplicationResponse.from(result));
    }

    @GetMapping("/name/{name}")
    @Operation(summary = "Get application by name", description = "Retrieves an application by its name")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Application retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Application not found")
    })
    ResponseEntity<ApplicationResponse> getApplicationByName(@PathVariable String name) {
        var result = queryService.getApplicationByName(name);
        return ResponseEntity.ok(ApplicationResponse.from(result));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update application", description = "Updates an existing application")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Application updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input"),
        @ApiResponse(responseCode = "404", description = "Application not found")
    })
    ResponseEntity<ApplicationResponse> updateApplication(
            @PathVariable String id,
            @Valid @RequestBody UpdateApplicationRequest request) {

        var cmd = new UpdateApplicationCmd(id, request.name(), request.description());
        commandService.updateApplication(cmd);

        var result = queryService.getApplicationById(id);
        return ResponseEntity.ok(ApplicationResponse.from(result));
    }

    @PostMapping("/{id}/activate")
    @Operation(summary = "Activate application", description = "Activates a deactivated application")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Application activated successfully"),
        @ApiResponse(responseCode = "404", description = "Application not found")
    })
    ResponseEntity<ApplicationResponse> activateApplication(@PathVariable String id) {
        commandService.activateApplication(id);
        var result = queryService.getApplicationById(id);
        return ResponseEntity.ok(ApplicationResponse.from(result));
    }

    @PostMapping("/{id}/deactivate")
    @Operation(summary = "Deactivate application", description = "Deactivates an active application")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Application deactivated successfully"),
        @ApiResponse(responseCode = "404", description = "Application not found")
    })
    ResponseEntity<ApplicationResponse> deactivateApplication(@PathVariable String id) {
        commandService.deactivateApplication(id);
        var result = queryService.getApplicationById(id);
        return ResponseEntity.ok(ApplicationResponse.from(result));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete application", description = "Deletes an application permanently")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Application deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Application not found")
    })
    ResponseEntity<Void> deleteApplication(@PathVariable String id) {
        commandService.deleteApplication(id);
        return ResponseEntity.noContent().build();
    }
}
