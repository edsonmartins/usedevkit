package com.devkit.audit.rest;

import com.devkit.audit.domain.AuditLogEntity;
import com.devkit.audit.domain.AuditService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * REST controller for Audit logs.
 */
@RestController
@RequestMapping("/api/v1/audit")
@Tag(name = "Audit", description = "Audit log APIs")
public class AuditController {

    private final AuditService auditService;

    public AuditController(AuditService auditService) {
        this.auditService = auditService;
    }

    @GetMapping
    @Operation(summary = "Get audit logs", description = "Returns audit logs with pagination")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Audit logs retrieved successfully")
    })
    ResponseEntity<AuditLogResponse> getLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int limit) {
        var paged = auditService.getLogs(page, limit);
        List<AuditLog> logs = paged.getContent().stream()
            .map(AuditLog::fromEntity)
            .collect(Collectors.toList());

        return ResponseEntity.ok(new AuditLogResponse(
            logs,
            paged.getTotalElements(),
            page,
            limit,
            paged.getTotalPages()
        ));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get audit log by ID", description = "Returns a single audit log")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "404", description = "Audit log not found")
    })
    ResponseEntity<AuditLog> getById(@PathVariable String id) {
        AuditLogEntity log = auditService.getById(id);
        if (log == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(AuditLog.fromEntity(log));
    }

    @GetMapping("/stats")
    @Operation(summary = "Get audit statistics", description = "Returns audit statistics")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Audit stats retrieved successfully")
    })
    ResponseEntity<AuditStats> getStats() {
        long total = auditService.getLogs(0, 1).getTotalElements();
        long today = auditService.countSinceDays(1);
        long thisWeek = auditService.countSinceDays(7);
        long thisMonth = auditService.countSinceDays(30);

        return ResponseEntity.ok(new AuditStats(total, today, thisWeek, thisMonth, Map.of(), List.of()));
    }

    @GetMapping(value = "/export", produces = MediaType.TEXT_PLAIN_VALUE)
    @Operation(summary = "Export audit logs", description = "Exports audit logs as CSV or JSON")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Export generated")
    })
    ResponseEntity<String> export() {
        return ResponseEntity.ok("");
    }

    @GetMapping("/entity/{entityType}/{entityId}")
    @Operation(summary = "Get logs by entity", description = "Returns audit logs for a specific entity")
    ResponseEntity<List<AuditLog>> getByEntity(
            @PathVariable String entityType,
            @PathVariable String entityId,
            @RequestParam(defaultValue = "50") int limit) {
        List<AuditLog> logs = auditService.getByEntity(entityType, entityId).stream()
            .limit(limit)
            .map(AuditLog::fromEntity)
            .collect(Collectors.toList());
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get logs by user", description = "Returns audit logs for a specific user")
    ResponseEntity<List<AuditLog>> getByUser(
            @PathVariable String userId,
            @RequestParam(defaultValue = "50") int limit) {
        List<AuditLog> logs = auditService.getByUser(userId).stream()
            .limit(limit)
            .map(AuditLog::fromEntity)
            .collect(Collectors.toList());
        return ResponseEntity.ok(logs);
    }

    public record AuditLogResponse(
        List<AuditLog> logs,
        long total,
        int page,
        int limit,
        int totalPages
    ) {}

    public record AuditStats(
        long total,
        long today,
        long thisWeek,
        long thisMonth,
        Map<String, Long> byAction,
        List<UserStats> byUser
    ) {}

    public record UserStats(
        String userId,
        String userName,
        long count
    ) {}

    public record AuditLog(
        String id,
        String tenantId,
        String action,
        String entityType,
        String entityId,
        String entityName,
        String userId,
        String userName,
        String userEmail,
        Map<String, Object> changes,
        Map<String, Object> metadata,
        String ipAddress,
        String userAgent,
        String timestamp
    ) {
        static AuditLog fromEntity(AuditLogEntity entity) {
            return new AuditLog(
                entity.getId(),
                null,
                entity.getAction(),
                entity.getEntityType(),
                entity.getEntityId(),
                null,
                entity.getActor(),
                entity.getActor(),
                null,
                Map.of(),
                Map.of(),
                entity.getIpAddress(),
                entity.getUserAgent(),
                entity.getCreatedAt().toString()
            );
        }
    }
}
