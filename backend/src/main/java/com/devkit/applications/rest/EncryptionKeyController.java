package com.devkit.applications.rest;

import com.devkit.applications.domain.EncryptionKeyService;
import com.devkit.applications.domain.EncryptionKeyService.EncryptionKeyResult;
import com.devkit.shared.domain.ResourceNotFoundException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller for Application Encryption Keys.
 * Manages per-application encryption keys for compartmentalized security.
 */
@RestController
@RequestMapping("/api/v1/applications/{applicationId}/encryption-key")
@Tag(name = "Application Encryption Keys", description = "Per-application encryption key management APIs")
public class EncryptionKeyController {

    private final EncryptionKeyService encryptionKeyService;

    EncryptionKeyController(EncryptionKeyService encryptionKeyService) {
        this.encryptionKeyService = encryptionKeyService;
    }

    @PostMapping
    @Operation(summary = "Create or set encryption key", description = "Creates or sets an encryption key for an application. The plaintext key is only returned once.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Encryption key created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input"),
        @ApiResponse(responseCode = "404", description = "Application not found")
    })
    ResponseEntity<EncryptionKeyResponse> createEncryptionKey(
            @PathVariable String applicationId,
            @Valid @RequestBody CreateEncryptionKeyRequest request) {

        EncryptionKeyResult result = encryptionKeyService.createEncryptionKey(
                applicationId,
                request.key(),
                request.createdBy()
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(EncryptionKeyResponse.withKey(
                        result.applicationId(),
                        result.keyHash(),
                        result.keyVersion(),
                        result.plaintextKey(),
                        result.createdAt()
                ));
    }

    @GetMapping
    @Operation(summary = "Get encryption key info", description = "Returns encryption key information without the plaintext key")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Encryption key info retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Encryption key not found")
    })
    ResponseEntity<EncryptionKeyResponse> getEncryptionKey(@PathVariable String applicationId) {
        EncryptionKeyResult result = encryptionKeyService.getEncryptionKey(applicationId);

        return ResponseEntity.ok(EncryptionKeyResponse.withoutKey(
                result.applicationId(),
                result.keyHash(),
                result.keyVersion(),
                result.isActive(),
                result.lastRotatedAt(),
                result.rotatedBy(),
                result.createdAt(),
                result.updatedAt()
        ));
    }

    @PutMapping("/rotate")
    @Operation(summary = "Rotate encryption key", description = "Rotates the encryption key with a new one. Returns the new key for one-time display.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Encryption key rotated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input"),
        @ApiResponse(responseCode = "404", description = "Application or encryption key not found")
    })
    ResponseEntity<EncryptionKeyResponse> rotateEncryptionKey(
            @PathVariable String applicationId,
            @Valid @RequestBody RotateEncryptionKeyRequest request) {

        EncryptionKeyResult result = encryptionKeyService.rotateEncryptionKey(
                applicationId,
                request.newKey(),
                request.rotatedBy()
        );

        return ResponseEntity.ok(EncryptionKeyResponse.afterRotation(
                result.applicationId(),
                result.keyHash(),
                result.keyVersion(),
                result.rotatedBy(),
                result.lastRotatedAt(),
                result.updatedAt()
        ));
    }

    @DeleteMapping
    @Operation(summary = "Delete encryption key", description = "Deactivates the encryption key. WARNING: All encrypted data will become inaccessible!")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Encryption key deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Encryption key not found")
    })
    ResponseEntity<Void> deleteEncryptionKey(@PathVariable String applicationId) {
        encryptionKeyService.deleteEncryptionKey(applicationId);
        return ResponseEntity.noContent().build();
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    ResponseEntity<String> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    ResponseEntity<String> handleBadRequest(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
    }
}
