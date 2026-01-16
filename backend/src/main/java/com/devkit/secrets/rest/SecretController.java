package com.devkit.secrets.rest;

import com.devkit.secrets.domain.*;
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
 * REST Controller for Secrets.
 */
@RestController
@RequestMapping("/api/v1/secrets")
@Tag(name = "Secrets", description = "Secret management APIs")
public class SecretController {

    private final SecretCommandService commandService;
    private final SecretQueryService queryService;

    SecretController(
            SecretCommandService commandService,
            SecretQueryService queryService) {
        this.commandService = commandService;
        this.queryService = queryService;
    }

    @PostMapping
    @Operation(summary = "Create a new secret", description = "Creates a new secret with the provided encrypted value")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Secret created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input")
    })
    ResponseEntity<SecretResponse> createSecret(@Valid @RequestBody CreateSecretRequest request) {
        var cmd = new CreateSecretCmd(
            request.key(),
            request.encryptedValue(),
            request.description(),
            request.applicationId(),
            request.environmentId(),
            request.rotationPolicy()
        );

        String secretId = commandService.createSecret(cmd);
        var result = queryService.getSecretById(secretId);

        return ResponseEntity
            .created(URI.create("/api/v1/secrets/" + secretId))
            .body(SecretResponse.from(result));
    }

    @GetMapping
    @Operation(summary = "Get active secrets", description = "Retrieves all active secrets")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Secrets retrieved successfully")
    })
    ResponseEntity<List<SecretResponse>> getActiveSecrets() {
        var secrets = queryService.getAllActiveSecrets();
        var responses = secrets.stream()
            .map(SecretResponse::from)
            .toList();

        return ResponseEntity.ok(responses);
    }

    @GetMapping("/application/{applicationId}")
    @Operation(summary = "Get secrets by application", description = "Retrieves all active secrets for an application")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Secrets retrieved successfully")
    })
    ResponseEntity<List<SecretResponse>> getSecretsByApplication(@PathVariable String applicationId) {
        var secrets = queryService.getSecretsByApplication(applicationId);
        var responses = secrets.stream()
            .map(SecretResponse::from)
            .toList();

        return ResponseEntity.ok(responses);
    }

    @GetMapping("/application/{applicationId}/environment/{environmentId}")
    @Operation(summary = "Get secrets by application and environment", description = "Retrieves all secrets for an application in a specific environment")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Secrets retrieved successfully")
    })
    ResponseEntity<List<SecretResponse>> getSecretsByApplicationAndEnvironment(
            @PathVariable String applicationId,
            @PathVariable String environmentId) {
        var secrets = queryService.getSecretsByApplicationAndEnvironment(applicationId, environmentId);
        var responses = secrets.stream()
            .map(SecretResponse::from)
            .toList();

        return ResponseEntity.ok(responses);
    }

    @GetMapping("/application/{applicationId}/environment/{environmentId}/map")
    @Operation(summary = "Get secrets as map", description = "Retrieves all secrets as a key-value map with decrypted values for SDK consumption")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Secret map retrieved successfully")
    })
    ResponseEntity<Map<String, String>> getSecretMap(
            @PathVariable String applicationId,
            @PathVariable String environmentId) {
        var secretMap = queryService.getSecretMap(applicationId, environmentId);
        return ResponseEntity.ok(secretMap);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get secret by ID", description = "Retrieves a secret by its ID (without decrypted value)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Secret retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Secret not found")
    })
    ResponseEntity<SecretResponse> getSecretById(@PathVariable String id) {
        var result = queryService.getSecretById(id);
        return ResponseEntity.ok(SecretResponse.from(result));
    }

    @GetMapping("/{id}/decrypt")
    @Operation(summary = "Get secret with decrypted value", description = "Retrieves a secret by its ID with decrypted value")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Secret retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Secret not found")
    })
    ResponseEntity<SecretResponseWithDecrypted> getSecretWithDecryptedValue(@PathVariable String id) {
        var result = queryService.getSecretWithDecryptedValue(id);
        return ResponseEntity.ok(SecretResponseWithDecrypted.from(result));
    }

    @PostMapping("/{id}/rotate")
    @Operation(summary = "Rotate a secret", description = "Rotates a secret with a new encrypted value")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Secret rotated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input"),
        @ApiResponse(responseCode = "404", description = "Secret not found")
    })
    ResponseEntity<SecretResponse> rotateSecret(
            @PathVariable String id,
            @Valid @RequestBody RotateSecretRequest request) {
        var cmd = new RotateSecretCmd(id, request.newEncryptedValue(), request.rotatedBy());
        commandService.rotateSecret(cmd);
        var result = queryService.getSecretById(id);

        return ResponseEntity.ok(SecretResponse.from(result));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a secret", description = "Updates secret metadata and rotation policy")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Secret updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input"),
        @ApiResponse(responseCode = "404", description = "Secret not found")
    })
    ResponseEntity<SecretResponse> updateSecret(
            @PathVariable String id,
            @Valid @RequestBody UpdateSecretRequest request) {
        var cmd = new UpdateSecretCmd(
            id,
            request.encryptedValue(),
            request.description(),
            request.rotationPolicy(),
            request.applicationId(),
            request.environmentId()
        );
        commandService.updateSecret(cmd);
        var result = queryService.getSecretById(id);
        return ResponseEntity.ok(SecretResponse.from(result));
    }

    @PostMapping("/{id}/deactivate")
    @Operation(summary = "Deactivate a secret", description = "Deactivates a secret by its ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Secret deactivated successfully"),
        @ApiResponse(responseCode = "404", description = "Secret not found")
    })
    ResponseEntity<SecretResponse> deactivateSecret(@PathVariable String id) {
        commandService.deactivateSecret(id);
        var result = queryService.getSecretById(id);
        return ResponseEntity.ok(SecretResponse.from(result));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a secret", description = "Deletes a secret by its ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Secret deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Secret not found")
    })
    ResponseEntity<Void> deleteSecret(@PathVariable String id) {
        commandService.deleteSecret(id);
        return ResponseEntity.noContent().build();
    }
}
