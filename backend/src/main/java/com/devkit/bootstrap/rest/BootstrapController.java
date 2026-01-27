package com.devkit.bootstrap.rest;

import com.devkit.bootstrap.domain.BootstrapException;
import com.devkit.bootstrap.domain.BootstrapService;
import com.devkit.bootstrap.dto.BootstrapRequest;
import com.devkit.bootstrap.dto.BootstrapResponse;
import com.devkit.bootstrap.dto.BootstrapStatusResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller for system bootstrap.
 * These endpoints are PUBLIC and used for initial system setup.
 */
@RestController
@RequestMapping("/api/v1/bootstrap")
@Tag(name = "Bootstrap", description = "Initial system setup APIs")
public class BootstrapController {

    private final BootstrapService bootstrapService;

    public BootstrapController(BootstrapService bootstrapService) {
        this.bootstrapService = bootstrapService;
    }

    @GetMapping("/status")
    @Operation(
        summary = "Check bootstrap status",
        description = "Check if the system needs initial setup. Returns needsSetup=true if no tenant exists."
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Status retrieved successfully")
    })
    public ResponseEntity<BootstrapStatusResponse> getStatus() {
        return ResponseEntity.ok(bootstrapService.getStatus());
    }

    @PostMapping
    @Operation(
        summary = "Perform initial bootstrap",
        description = "Create initial tenant, application, and API key. This endpoint only works once."
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Bootstrap completed successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request"),
        @ApiResponse(responseCode = "409", description = "System already configured")
    })
    public ResponseEntity<BootstrapResponse> bootstrap(@Valid @RequestBody BootstrapRequest request) {
        try {
            BootstrapResponse response = bootstrapService.bootstrap(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (BootstrapException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(
                new BootstrapResponse(null, null, null, null, null, e.getMessage())
            );
        }
    }
}
