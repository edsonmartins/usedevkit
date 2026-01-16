package com.devkit.configurations.rest;

import com.devkit.configurations.domain.ConfigurationQueryService;
import com.devkit.configurations.domain.ConfigurationResult;
import com.devkit.configurations.domain.ConfigurationVersionEntity;
import com.devkit.configurations.domain.ConfigurationRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for Configuration Version History.
 */
@RestController
@RequestMapping("/api/v1/configurations")
@Tag(name = "Configuration Versions", description = "Configuration version history and rollback APIs")
public class ConfigurationVersionController {

    private final ConfigurationRepository configurationRepository;
    private final ConfigurationQueryService queryService;

    ConfigurationVersionController(
            ConfigurationRepository configurationRepository,
            ConfigurationQueryService queryService) {
        this.configurationRepository = configurationRepository;
        this.queryService = queryService;
    }

    /**
     * Get version history for a configuration.
     * @param configurationId the configuration ID
     * @return list of all versions
     */
    @GetMapping("/{configurationId}/versions")
    @Operation(summary = "Get configuration version history", description = "Retrieves all historical versions of a configuration")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Version history retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Configuration not found")
    })
    ResponseEntity<List<ConfigurationVersionResponse>> getConfigurationVersions(
            @PathVariable String configurationId) {

        var configuration = configurationRepository.findById(
                com.devkit.configurations.domain.vo.ConfigurationId.of(configurationId)
        ).orElseThrow(() -> new IllegalArgumentException(
                "Configuration not found with id: " + configurationId));

        List<ConfigurationVersionEntity> versions = List.copyOf(configuration.getVersionHistory());

        List<ConfigurationVersionResponse> responses = versions.stream()
                .map(ConfigurationVersionResponse::fromEntity)
                .toList();

        return ResponseEntity.ok(responses);
    }

    /**
     * Get specific version of a configuration.
     * @param configurationId the configuration ID
     * @param versionNumber the version number
     * @return the version details
     */
    @GetMapping("/{configurationId}/versions/{versionNumber}")
    @Operation(summary = "Get specific configuration version", description = "Retrieves a specific version of a configuration")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Version retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Configuration or version not found")
    })
    ResponseEntity<ConfigurationVersionResponse> getConfigurationVersion(
            @PathVariable String configurationId,
            @PathVariable int versionNumber) {

        var configuration = configurationRepository.findById(
                com.devkit.configurations.domain.vo.ConfigurationId.of(configurationId)
        ).orElseThrow(() -> new IllegalArgumentException(
                "Configuration not found with id: " + configurationId));

        ConfigurationVersionEntity version = configuration.getVersionHistory().stream()
                .filter(v -> v.getVersionNumber() == versionNumber)
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException(
                        "Version " + versionNumber + " not found"));

        return ResponseEntity.ok(ConfigurationVersionResponse.fromEntity(version));
    }

    /**
     * Rollback configuration to a specific version.
     * @param configurationId the configuration ID
     * @param versionNumber the version number to rollback to
     * @return the updated configuration
     */
    @PostMapping("/{configurationId}/versions/{versionNumber}/rollback")
    @Operation(summary = "Rollback to previous version", description = "Rolls back a configuration to a specific previous version")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Configuration rolled back successfully"),
        @ApiResponse(responseCode = "404", description = "Configuration or version not found")
    })
    ResponseEntity<ConfigurationResponse> rollbackToVersion(
            @PathVariable String configurationId,
            @PathVariable int versionNumber) {

        var configuration = configurationRepository.findById(
                com.devkit.configurations.domain.vo.ConfigurationId.of(configurationId)
        ).orElseThrow(() -> new IllegalArgumentException(
                "Configuration not found with id: " + configurationId));

        // Find the target version
        ConfigurationVersionEntity targetVersion = configuration.getVersionHistory().stream()
                .filter(v -> v.getVersionNumber() == versionNumber)
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException(
                        "Version " + versionNumber + " not found"));

        // Create version history of current state before rollback
        ConfigurationVersionEntity currentVersion = ConfigurationVersionEntity.create(
                configuration.getVersionNumber(),
                configuration.getValue(),
                "ROLLBACK",
                "SYSTEM",
                configuration
        );
        configuration.addVersion(currentVersion);

        // Restore to target version values
        configuration.updateValue(targetVersion.getValue());
        configuration.updateType(targetVersion.getConfiguration().getType());

        configurationRepository.save(configuration);

        var result = queryService.getConfigurationById(configurationId);
        return ResponseEntity.ok(ConfigurationResponse.from(result));
    }
}
