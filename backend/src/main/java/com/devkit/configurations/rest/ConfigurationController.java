package com.devkit.configurations.rest;

import com.devkit.configurations.domain.*;
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
 * REST Controller for Configurations.
 */
@RestController
@RequestMapping("/api/v1/configurations")
@Tag(name = "Configurations", description = "Configuration management APIs")
public class ConfigurationController {

    private final ConfigurationCommandService commandService;
    private final ConfigurationQueryService queryService;

    ConfigurationController(
            ConfigurationCommandService commandService,
            ConfigurationQueryService queryService) {
        this.commandService = commandService;
        this.queryService = queryService;
    }

    @PostMapping
    @Operation(summary = "Create a new configuration", description = "Creates a new configuration with the provided details")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Configuration created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input")
    })
    ResponseEntity<ConfigurationResponse> createConfiguration(@Valid @RequestBody CreateConfigurationRequest request) {
        var cmd = new CreateConfigurationCmd(
            request.key(),
            request.value(),
            request.type(),
            request.description(),
            request.isSecret(),
            request.environmentId()
        );

        String configurationId = commandService.createConfiguration(cmd);
        var result = queryService.getConfigurationById(configurationId);

        return ResponseEntity
            .created(URI.create("/api/v1/configurations/" + configurationId))
            .body(ConfigurationResponse.from(result));
    }

    @GetMapping("/environment/{environmentId}")
    @Operation(summary = "Get configurations by environment", description = "Retrieves all configurations for a specific environment")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Configurations retrieved successfully")
    })
    ResponseEntity<List<ConfigurationResponse>> getConfigurationsByEnvironment(@PathVariable String environmentId) {
        var configurations = queryService.getConfigurationsByEnvironment(environmentId);
        var responses = configurations.stream()
            .map(ConfigurationResponse::from)
            .toList();

        return ResponseEntity.ok(responses);
    }

    @GetMapping("/environment/{environmentId}/map")
    @Operation(summary = "Get configurations as map", description = "Retrieves all configurations as a key-value map for SDK consumption")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Configuration map retrieved successfully")
    })
    ResponseEntity<Map<String, String>> getConfigurationMap(@PathVariable String environmentId) {
        var configMap = queryService.getConfigurationMap(environmentId);
        return ResponseEntity.ok(configMap);
    }

    @GetMapping("/environment/{environmentId}/non-secret")
    @Operation(summary = "Get non-secret configurations", description = "Retrieves all non-secret configurations for an environment")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Non-secret configurations retrieved successfully")
    })
    ResponseEntity<List<ConfigurationResponse>> getNonSecretConfigurations(@PathVariable String environmentId) {
        var configurations = queryService.getNonSecretConfigurations(environmentId);
        var responses = configurations.stream()
            .map(ConfigurationResponse::from)
            .toList();

        return ResponseEntity.ok(responses);
    }

    @GetMapping("/environment/{environmentId}/secret")
    @Operation(summary = "Get secret configurations", description = "Retrieves all secret configurations for an environment")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Secret configurations retrieved successfully")
    })
    ResponseEntity<List<ConfigurationResponse>> getSecretConfigurations(@PathVariable String environmentId) {
        var configurations = queryService.getSecretConfigurations(environmentId);
        var responses = configurations.stream()
            .map(ConfigurationResponse::from)
            .toList();

        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get configuration by ID", description = "Retrieves a configuration by its ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Configuration retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Configuration not found")
    })
    ResponseEntity<ConfigurationResponse> getConfigurationById(@PathVariable String id) {
        var result = queryService.getConfigurationById(id);
        return ResponseEntity.ok(ConfigurationResponse.from(result));
    }

    @GetMapping("/environment/{environmentId}/key/{key}")
    @Operation(summary = "Get configuration by environment and key", description = "Retrieves a configuration by environment and key")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Configuration retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Configuration not found")
    })
    ResponseEntity<ConfigurationResponse> getConfigurationByEnvironmentAndKey(
            @PathVariable String environmentId,
            @PathVariable String key) {
        var result = queryService.getConfigurationByEnvironmentAndKey(environmentId, key);
        return ResponseEntity.ok(ConfigurationResponse.from(result));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a configuration", description = "Updates an existing configuration")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Configuration updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input"),
        @ApiResponse(responseCode = "404", description = "Configuration not found")
    })
    ResponseEntity<ConfigurationResponse> updateConfiguration(
            @PathVariable String id,
            @Valid @RequestBody UpdateConfigurationRequest request) {
        var cmd = new UpdateConfigurationCmd(
            id,
            request.value(),
            request.type(),
            request.description(),
            request.isSecret()
        );

        commandService.updateConfiguration(cmd);
        var result = queryService.getConfigurationById(id);

        return ResponseEntity.ok(ConfigurationResponse.from(result));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a configuration", description = "Deletes a configuration by its ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Configuration deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Configuration not found")
    })
    ResponseEntity<Void> deleteConfiguration(@PathVariable String id) {
        commandService.deleteConfiguration(id);
        return ResponseEntity.noContent().build();
    }
}
