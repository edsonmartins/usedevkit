package com.devkit.promotions.rest;

import com.devkit.promotions.domain.EnvironmentPromotionService;
import com.devkit.promotions.domain.PromotionDiffEntity;
import com.devkit.promotions.domain.PromotionRequestEntity;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for Environment Promotion.
 */
@RestController
@RequestMapping("/api/v1/promotions")
public class PromotionController {

    private static final Logger logger = LoggerFactory.getLogger(PromotionController.class);

    private final EnvironmentPromotionService promotionService;

    public PromotionController(EnvironmentPromotionService promotionService) {
        this.promotionService = promotionService;
    }

    // ==================== Promotion Request Management ====================

    /**
     * Create a new promotion request.
     */
    @PostMapping
    public ResponseEntity<PromotionRequestDTO> createPromotionRequest(
            @Valid @RequestBody CreatePromotionRequestDTO request) {

        logger.info("Creating promotion request from {} to {}",
            request.sourceEnvironment(), request.targetEnvironment());

        String promotionId = promotionService.createPromotionRequest(
            request.applicationId(),
            request.sourceEnvironment(),
            request.targetEnvironment(),
            request.requestedBy(),
            request.includeAllConfigs(),
            request.configKeys(),
            request.smokeTestEnabled()
        );

        PromotionRequestEntity entity = promotionService.getPromotionRequestEntity(promotionId);

        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(PromotionRequestDTO.fromEntityWithoutDiffs(entity));
    }

    /**
     * Get a promotion request by ID with diffs.
     */
    @GetMapping("/{id}")
    public ResponseEntity<PromotionRequestDTO> getPromotionRequest(@PathVariable String id) {
        logger.debug("Getting promotion request: {}", id);

        PromotionRequestEntity entity = promotionService.getPromotionRequestWithDiffsEntity(id);

        return ResponseEntity.ok(PromotionRequestDTO.fromEntity(entity));
    }

    /**
     * List all promotion requests.
     */
    @GetMapping
    public ResponseEntity<List<PromotionRequestDTO>> listPromotionRequests(
            @RequestParam(required = false) String applicationId,
            @RequestParam(required = false) PromotionRequestEntity.PromotionStatus status) {

        logger.debug("Listing promotion requests with filters: applicationId={}, status={}",
            applicationId, status);

        List<PromotionRequestEntity> entities;

        if (applicationId != null && status != null) {
            entities = promotionService.findByApplicationIdAndStatus(applicationId, status);
        } else if (applicationId != null) {
            entities = promotionService.findByApplicationId(applicationId);
        } else if (status != null) {
            entities = promotionService.findByStatus(status);
        } else {
            entities = promotionService.findAllPromotionRequests();
        }

        List<PromotionRequestDTO> dtos = entities.stream()
            .map(PromotionRequestDTO::fromEntityWithoutDiffs)
            .toList();

        return ResponseEntity.ok(dtos);
    }

    /**
     * Get recent promotion requests.
     */
    @GetMapping("/recent")
    public ResponseEntity<List<PromotionRequestDTO>> getRecentPromotions(
            @RequestParam(defaultValue = "10") int limit) {

        logger.debug("Getting recent promotions, limit={}", limit);

        List<PromotionRequestEntity> entities = promotionService.findRecentPromotions(limit);

        List<PromotionRequestDTO> dtos = entities.stream()
            .map(PromotionRequestDTO::fromEntityWithoutDiffs)
            .toList();

        return ResponseEntity.ok(dtos);
    }

    // ==================== Approval Workflow ====================

    /**
     * Approve a promotion request.
     */
    @PostMapping("/{id}/approve")
    public ResponseEntity<PromotionRequestDTO> approvePromotion(
            @PathVariable String id,
            @Valid @RequestBody ApprovePromotionDTO request) {

        logger.info("Approving promotion request: {} by {}", id, request.approvedBy());

        promotionService.approvePromotion(id, request.approvedBy(), request.reason());

        PromotionRequestEntity entity = promotionService.getPromotionRequestEntity(id);

        return ResponseEntity.ok(PromotionRequestDTO.fromEntityWithoutDiffs(entity));
    }

    /**
     * Reject a promotion request.
     */
    @PostMapping("/{id}/reject")
    public ResponseEntity<PromotionRequestDTO> rejectPromotion(
            @PathVariable String id,
            @Valid @RequestBody RejectPromotionDTO request) {

        logger.info("Rejecting promotion request: {} by {}", id, request.rejectedBy());

        promotionService.rejectPromotion(id, request.rejectedBy(), request.reason());

        PromotionRequestEntity entity = promotionService.getPromotionRequestEntity(id);

        return ResponseEntity.ok(PromotionRequestDTO.fromEntityWithoutDiffs(entity));
    }

    // ==================== Execution ====================

    /**
     * Execute a promotion request.
     */
    @PostMapping("/{id}/execute")
    public ResponseEntity<PromotionRequestDTO> executePromotion(@PathVariable String id) {
        logger.info("Executing promotion request: {}", id);

        promotionService.executePromotion(id);

        PromotionRequestEntity entity = promotionService.getPromotionRequestEntity(id);

        return ResponseEntity.ok(PromotionRequestDTO.fromEntityWithoutDiffs(entity));
    }

    /**
     * Rollback a promotion request.
     */
    @PostMapping("/{id}/rollback")
    public ResponseEntity<PromotionRequestDTO> rollbackPromotion(
            @PathVariable String id,
            @RequestParam(defaultValue = "Manual rollback") String reason) {

        logger.info("Rolling back promotion request: {}", id);

        promotionService.rollbackPromotion(id, reason);

        PromotionRequestEntity entity = promotionService.getPromotionRequestEntity(id);

        return ResponseEntity.ok(PromotionRequestDTO.fromEntityWithoutDiffs(entity));
    }

    // ==================== Diff Operations ====================

    /**
     * Get diff summary for a promotion request.
     */
    @GetMapping("/{id}/diff/summary")
    public ResponseEntity<DiffSummaryDTO> getDiffSummary(@PathVariable String id) {
        logger.debug("Getting diff summary for promotion: {}", id);

        EnvironmentPromotionService.DiffSummary summary =
            promotionService.getDiffSummary(id);

        return ResponseEntity.ok(DiffSummaryDTO.fromDomain(summary));
    }

    /**
     * Get all diffs for a promotion request.
     */
    @GetMapping("/{id}/diffs")
    public ResponseEntity<List<PromotionDiffDTO>> getDiffs(@PathVariable String id) {
        logger.debug("Getting diffs for promotion: {}", id);

        List<PromotionDiffEntity> diffs = promotionService.getDiffs(id);

        List<PromotionDiffDTO> dtos = diffs.stream()
            .map(PromotionDiffDTO::fromEntity)
            .toList();

        return ResponseEntity.ok(dtos);
    }

    /**
     * Recalculate diffs for a promotion request.
     */
    @PostMapping("/{id}/diffs/recalculate")
    public ResponseEntity<List<PromotionDiffDTO>> recalculateDiffs(@PathVariable String id) {
        logger.info("Recalculating diffs for promotion: {}", id);

        List<PromotionDiffEntity> diffs = promotionService.calculateDiffs(id);

        List<PromotionDiffDTO> dtos = diffs.stream()
            .map(PromotionDiffDTO::fromEntity)
            .toList();

        return ResponseEntity.ok(dtos);
    }

    // ==================== Statistics ====================

    /**
     * Get promotion statistics.
     */
    @GetMapping("/stats")
    public ResponseEntity<PromotionStatsDTO> getStatistics() {
        logger.debug("Getting promotion statistics");

        long pendingCount = promotionService.countByStatus(
            PromotionRequestEntity.PromotionStatus.PENDING_APPROVAL
        );
        long approvedCount = promotionService.countByStatus(
            PromotionRequestEntity.PromotionStatus.APPROVED
        );
        long completedCount = promotionService.countByStatus(
            PromotionRequestEntity.PromotionStatus.COMPLETED
        );
        long failedCount = promotionService.countByStatus(
            PromotionRequestEntity.PromotionStatus.FAILED
        );
        long rejectedCount = promotionService.countByStatus(
            PromotionRequestEntity.PromotionStatus.REJECTED
        );

        PromotionStatsDTO stats = new PromotionStatsDTO(
            pendingCount,
            approvedCount,
            completedCount,
            failedCount,
            rejectedCount
        );

        return ResponseEntity.ok(stats);
    }

    /**
     * DTO for promotion statistics.
     */
    public record PromotionStatsDTO(
        long pendingCount,
        long approvedCount,
        long completedCount,
        long failedCount,
        long rejectedCount
    ) {}
}
