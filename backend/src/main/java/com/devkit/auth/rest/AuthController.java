package com.devkit.auth.rest;

import com.devkit.auth.security.*;
import com.devkit.shared.domain.ResourceNotFoundException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller for Authentication.
 */
@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Authentication", description = "Authentication and authorization APIs")
public class AuthController {

    private final ApiKeyAuthService apiKeyAuthService;

    AuthController(ApiKeyAuthService apiKeyAuthService) {
        this.apiKeyAuthService = apiKeyAuthService;
    }

    @PostMapping("/authenticate")
    @Operation(summary = "Authenticate with API key", description = "Authenticate using an API key and receive JWT tokens")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Authentication successful"),
        @ApiResponse(responseCode = "401", description = "Invalid credentials")
    })
    ResponseEntity<AuthenticationResponse> authenticate(@Valid @RequestBody AuthenticateRequest request) {
        var response = apiKeyAuthService.authenticate(request.apiKey());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token", description = "Refresh an access token using a refresh token")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Token refreshed successfully"),
        @ApiResponse(responseCode = "401", description = "Invalid refresh token")
    })
    ResponseEntity<AuthenticationResponse> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        var response = apiKeyAuthService.refreshToken(request.refreshToken());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/api-keys")
    @Operation(summary = "Generate new API key", description = "Generate a new API key for an application")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "API key generated successfully"),
        @ApiResponse(responseCode = "404", description = "Application not found")
    })
    ResponseEntity<ApiKeyResponse> generateApiKey(@Valid @RequestBody GenerateApiKeyRequest request) {
        String apiKey = apiKeyAuthService.generateApiKey(request.applicationId(), request.name());
        return ResponseEntity.ok(new ApiKeyResponse(apiKey));
    }
}

record AuthenticateRequest(@NotBlank String apiKey) {}
record RefreshTokenRequest(@NotBlank String refreshToken) {}
record GenerateApiKeyRequest(@NotBlank String applicationId, @NotBlank String name) {}
record ApiKeyResponse(String apiKey) {}
