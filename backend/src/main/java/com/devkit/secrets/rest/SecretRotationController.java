package com.devkit.secrets.rest;

import com.devkit.secrets.domain.SecretEntity;
import com.devkit.secrets.domain.SecretRepository;
import com.devkit.secrets.domain.SecretRotationEntity;
import com.devkit.secrets.domain.SecretRotationRepository;
import com.devkit.secrets.domain.SecretRotationScheduler;
import com.devkit.secrets.domain.vo.SecretId;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST Controller for Secret Rotation operations.
 */
@RestController
@RequestMapping("/api/v1/secrets")
@Tag(name = "Secret Rotations", description = "Secret rotation history and validation APIs")
public class SecretRotationController {

    private final SecretRotationRepository rotationRepository;
    private final SecretRepository secretRepository;
    private final SecretRotationScheduler rotationScheduler;

    SecretRotationController(
            SecretRotationRepository rotationRepository,
            SecretRepository secretRepository,
            SecretRotationScheduler rotationScheduler) {
        this.rotationRepository = rotationRepository;
        this.secretRepository = secretRepository;
        this.rotationScheduler = rotationScheduler;
    }

    @GetMapping("/{secretId}/rotations")
    @Operation(summary = "Get rotation history", description = "Retrieves the complete rotation history for a specific secret")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Rotation history retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Secret not found")
    })
    ResponseEntity<List<SecretRotationResponse>> getRotationHistory(@PathVariable String secretId) {
        // Verify secret exists
        if (!secretRepository.existsById(SecretId.of(secretId))) {
            return ResponseEntity.notFound().build();
        }

        List<SecretRotationEntity> rotations = rotationRepository
            .findBySecretIdOrderByRotationDateDesc(secretId);

        List<SecretRotationResponse> responses = rotations.stream()
            .map(SecretRotationResponse::fromEntity)
            .toList();

        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{secretId}/history")
    @Operation(summary = "Get rotation history (alias)", description = "Alias endpoint for rotation history")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Rotation history retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Secret not found")
    })
    ResponseEntity<List<SecretRotationResponse>> getRotationHistoryAlias(@PathVariable String secretId) {
        return getRotationHistory(secretId);
    }

    @GetMapping("/application/{applicationId}/rotations")
    @Operation(summary = "Get rotation history by application", description = "Retrieves all rotations for an application")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Rotation history retrieved successfully")
    })
    ResponseEntity<List<SecretRotationResponse>> getApplicationRotationHistory(@PathVariable String applicationId) {
        List<SecretRotationEntity> rotations = rotationRepository
            .findByApplicationIdOrderByRotationDateDesc(applicationId);

        List<SecretRotationResponse> responses = rotations.stream()
            .map(SecretRotationResponse::fromEntity)
            .toList();

        return ResponseEntity.ok(responses);
    }

    @GetMapping("/validate")
    @Operation(summary = "Validate secrets for rotation", description = "Checks which secrets need rotation based on their rotation policy")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Validation completed successfully")
    })
    ResponseEntity<ValidationResponse> validateSecrets(
            @RequestParam(required = false) String applicationId) {

        List<SecretEntity> secrets;
        if (applicationId != null) {
            secrets = secretRepository.findByApplicationId(applicationId);
        } else {
            secrets = secretRepository.findAll();
        }

        List<SecretEntity> needsRotation = secrets.stream()
            .filter(SecretEntity::isActive)
            .filter(SecretEntity::needsRotation)
            .toList();

        List<SecretEntity> expiringSoon = secrets.stream()
            .filter(SecretEntity::isActive)
            .filter(secret -> {
                Instant nextRotation = secret.getNextRotationDate();
                if (nextRotation == null) return false;

                // Expiring within 7 days
                Instant sevenDaysFromNow = Instant.now().plusSeconds(7 * 24 * 60 * 60);
                return nextRotation.isBefore(sevenDaysFromNow) && !secret.needsRotation();
            })
            .toList();

        Map<String, Object> details = new HashMap<>();
        details.put("totalSecrets", secrets.size());
        details.put("activeSecrets", secrets.stream().filter(SecretEntity::isActive).count());
        details.put("needsRotation", needsRotation.size());
        details.put("expiringSoon", expiringSoon.size());

        return ResponseEntity.ok(new ValidationResponse(
            needsRotation.stream().map(s -> Map.<String, Object>of(
                "id", s.getId().id(),
                "key", s.getKey(),
                "applicationId", s.getApplicationId(),
                "environmentId", s.getEnvironmentId(),
                "nextRotationDate", s.getNextRotationDate()
            )).toList(),
            expiringSoon.stream().map(s -> Map.<String, Object>of(
                "id", s.getId().id(),
                "key", s.getKey(),
                "applicationId", s.getApplicationId(),
                "environmentId", s.getEnvironmentId(),
                "nextRotationDate", s.getNextRotationDate()
            )).toList(),
            details
        ));
    }

    @GetMapping("/rotations/recent")
    @Operation(summary = "Get recent rotations", description = "Retrieves recent rotation activities across all secrets")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Recent rotations retrieved successfully")
    })
    ResponseEntity<List<SecretRotationResponse>> getRecentRotations(
            @RequestParam(defaultValue = "7") int days) {

        Instant since = Instant.now().minusSeconds(days * 24 * 60 * 60);
        List<SecretRotationEntity> rotations = rotationRepository
            .findByRotationDateAfterOrderByRotationDateDesc(since);

        List<SecretRotationResponse> responses = rotations.stream()
            .map(SecretRotationResponse::fromEntity)
            .toList();

        return ResponseEntity.ok(responses);
    }

    @GetMapping("/rotations/failed")
    @Operation(summary = "Get failed rotations", description = "Retrieves all failed rotation attempts")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Failed rotations retrieved successfully")
    })
    ResponseEntity<List<SecretRotationResponse>> getFailedRotations() {
        List<SecretRotationEntity> rotations = rotationRepository
            .findByStatusOrderByRotationDateDesc(SecretRotationEntity.RotationStatus.FAILED);

        List<SecretRotationResponse> responses = rotations.stream()
            .map(SecretRotationResponse::fromEntity)
            .toList();

        return ResponseEntity.ok(responses);
    }

    @GetMapping("/stats")
    @Operation(summary = "Get rotation statistics", description = "Retrieves statistics about secret rotations")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Statistics retrieved successfully")
    })
    ResponseEntity<RotationStatsResponse> getRotationStats(
            @RequestParam(required = false) String applicationId) {

        long totalRotations;
        long successfulRotations;
        long failedRotations;
        long manualRotations;
        long automaticRotations;

        if (applicationId != null) {
            List<SecretRotationEntity> allRotations = rotationRepository
                .findByApplicationIdOrderByRotationDateDesc(applicationId);

            totalRotations = allRotations.size();
            successfulRotations = allRotations.stream()
                .filter(r -> r.getStatus() == SecretRotationEntity.RotationStatus.SUCCESS)
                .count();
            failedRotations = allRotations.stream()
                .filter(r -> r.getStatus() == SecretRotationEntity.RotationStatus.FAILED)
                .count();
            manualRotations = allRotations.stream()
                .filter(r -> r.getReason() == SecretRotationEntity.RotationReason.MANUAL)
                .count();
            automaticRotations = allRotations.stream()
                .filter(r -> r.getReason() != SecretRotationEntity.RotationReason.MANUAL)
                .count();
        } else {
            totalRotations = rotationRepository.count();
            successfulRotations = rotationRepository
                .findByStatusOrderByRotationDateDesc(SecretRotationEntity.RotationStatus.SUCCESS)
                .size();
            failedRotations = rotationRepository
                .findByStatusOrderByRotationDateDesc(SecretRotationEntity.RotationStatus.FAILED)
                .size();
            // For simplicity, counting total rotations as proxy for manual/automatic split
            List<SecretRotationEntity> all = rotationRepository.findAll();
            manualRotations = all.stream()
                .filter(r -> r.getReason() == SecretRotationEntity.RotationReason.MANUAL)
                .count();
            automaticRotations = all.stream()
                .filter(r -> r.getReason() != SecretRotationEntity.RotationReason.MANUAL)
                .count();
        }

        return ResponseEntity.ok(new RotationStatsResponse(
            totalRotations,
            successfulRotations,
            failedRotations,
            manualRotations,
            automaticRotations,
            totalRotations > 0 ? (successfulRotations * 100.0 / totalRotations) : 0.0
        ));
    }

    @PostMapping("/rotate-due")
    @Operation(summary = "Trigger automatic rotation", description = "Manually trigger rotation for all secrets that are due")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Rotation triggered successfully")
    })
    ResponseEntity<Map<String, Object>> triggerAutomaticRotation(
            @RequestParam(required = false) String applicationId) {

        int rotatedCount;
        if (applicationId != null) {
            rotatedCount = rotationScheduler.rotateApplicationSecrets(applicationId);
        } else {
            rotatedCount = rotationScheduler.rotateDueSecrets();
        }

        Map<String, Object> response = Map.of(
            "message", "Automatic rotation triggered",
            "rotatedCount", rotatedCount,
            "timestamp", Instant.now().toString()
        );

        return ResponseEntity.ok(response);
    }

    // Response records
    record ValidationResponse(
        List<Map<String, Object>> needsRotation,
        List<Map<String, Object>> expiringSoon,
        Map<String, Object> details
    ) {}

    record RotationStatsResponse(
        long totalRotations,
        long successfulRotations,
        long failedRotations,
        long manualRotations,
        long automaticRotations,
        double successRate
    ) {}
}
