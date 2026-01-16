package com.devkit.promotions.domain;

import com.devkit.configurations.domain.ConfigurationQueryService;
import com.devkit.promotions.domain.vo.PromotionRequestId;
import com.devkit.shared.domain.ResourceNotFoundException;
import com.devkit.shared.domain.SpringEventPublisher;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

/**
 * Service for managing environment promotions.
 * Handles diff calculation, approval workflow, and safe promotion.
 */
@Service
@Transactional
public class EnvironmentPromotionService {

    private static final Logger logger = LoggerFactory.getLogger(EnvironmentPromotionService.class);

    private final PromotionRequestRepository promotionRepository;
    private final ConfigurationQueryService configQueryService;
    private final SpringEventPublisher eventPublisher;

    EnvironmentPromotionService(
            PromotionRequestRepository promotionRepository,
            ConfigurationQueryService configQueryService,
            SpringEventPublisher eventPublisher) {
        this.promotionRepository = promotionRepository;
        this.configQueryService = configQueryService;
        this.eventPublisher = eventPublisher;
    }

    // ==================== Promotion Management ====================

    /**
     * Create a new promotion request.
     */
    public String createPromotionRequest(
            String applicationId,
            String sourceEnvironment,
            String targetEnvironment,
            String requestedBy,
            Boolean includeAllConfigs,
            List<String> configKeys,
            Boolean smokeTestEnabled) {

        PromotionRequestEntity request = PromotionRequestEntity.create(
            applicationId,
            sourceEnvironment,
            targetEnvironment,
            requestedBy,
            includeAllConfigs,
            smokeTestEnabled
        );

        // Set config keys if not all configs
        if (!includeAllConfigs && configKeys != null && !configKeys.isEmpty()) {
            request.setConfigKeys(String.join(",", configKeys));
        }

        PromotionRequestEntity saved = promotionRepository.save(request);

        // Calculate diffs
        calculateDiffs(saved.getId().id());

        logger.info("Created promotion request: {} from {} to {}",
            applicationId, sourceEnvironment, targetEnvironment);

        return saved.getId().id();
    }

    /**
     * Calculate configuration diffs between source and target environments.
     */
    public List<PromotionDiffEntity> calculateDiffs(String promotionRequestId) {
        PromotionRequestEntity request = getPromotionRequest(promotionRequestId);

        // Clear existing diffs
        request.getDiffs().clear();

        // Get configurations from both environments
        Map<String, ConfigurationDiff> sourceConfigs = getConfigurations(
            request.getApplicationId(),
            request.getSourceEnvironment()
        );

        Map<String, ConfigurationDiff> targetConfigs = getConfigurations(
            request.getApplicationId(),
            request.getTargetEnvironment()
        );

        Set<String> allKeys = new HashSet<>();
        allKeys.addAll(sourceConfigs.keySet());
        allKeys.addAll(targetConfigs.keySet());

        // If specific keys selected, only diff those
        if (!request.getIncludeAllConfigs() && request.getConfigKeys() != null) {
            String[] keys = request.getConfigKeys().split(",");
            allKeys.retainAll(Arrays.asList(keys));
        }

        // Calculate diffs for each key
        for (String key : allKeys) {
            ConfigurationDiff source = sourceConfigs.get(key);
            ConfigurationDiff target = targetConfigs.get(key);

            PromotionDiffEntity diff;

            if (source != null && target == null) {
                // New config in source
                diff = PromotionDiffEntity.newConfig(
                    promotionRequestId,
                    key,
                    source.value,
                    source.type,
                    source.version
                );
            } else if (source != null && target != null) {
                // Config exists in both
                if (!source.value.equals(target.value) || !source.type.equals(target.type)) {
                    // Modified
                    diff = PromotionDiffEntity.modifiedConfig(
                        promotionRequestId,
                        key,
                        source.value,
                        target.value,
                        source.type,
                        target.type,
                        source.version,
                        target.version
                    );
                } else {
                    // Same
                    diff = PromotionDiffEntity.sameConfig(
                        promotionRequestId,
                        key,
                        source.value,
                        source.type,
                        source.version
                    );
                }
            } else if (source == null && target != null) {
                // Deleted in source (exists in target)
                diff = PromotionDiffEntity.deletedConfig(
                    promotionRequestId,
                    key,
                    target.value,
                    target.type,
                    target.version
                );
            } else {
                continue; // Should not happen
            }

            diff.setPromotionRequest(request);
            request.getDiffs().add(diff);
        }

        promotionRepository.save(request);

        return new ArrayList<>(request.getDiffs());
    }

    /**
     * Approve a promotion request.
     */
    public void approvePromotion(String promotionRequestId, String approvedBy, String reason) {
        PromotionRequestEntity request = getPromotionRequest(promotionRequestId);
        request.approve(approvedBy, reason);
        promotionRepository.save(request);

        logger.info("Approved promotion request: {} by {}", promotionRequestId, approvedBy);
    }

    /**
     * Reject a promotion request.
     */
    public void rejectPromotion(String promotionRequestId, String rejectedBy, String reason) {
        PromotionRequestEntity request = getPromotionRequest(promotionRequestId);
        request.reject(rejectedBy, reason);
        promotionRepository.save(request);

        logger.info("Rejected promotion request: {} by {}", promotionRequestId, rejectedBy);
    }

    /**
     * Execute the promotion.
     */
    public void executePromotion(String promotionRequestId) {
        PromotionRequestEntity request = getPromotionRequestWithDiffs(promotionRequestId);

        request.startPromotion();
        promotionRepository.save(request);

        try {
            // Run smoke tests if enabled
            if (request.getSmokeTestEnabled()) {
                boolean smokeTestsPassed = runSmokeTests(request);
                if (!smokeTestsPassed) {
                    request.fail("Smoke tests failed");
                    promotionRepository.save(request);
                    return;
                }
            }

            // Apply configuration changes
            applyConfigurationChanges(request);

            // Mark as completed
            request.complete();
            promotionRepository.save(request);

            logger.info("Completed promotion: {}", promotionRequestId);

        } catch (Exception e) {
            logger.error("Failed to execute promotion: {}", promotionRequestId, e);
            request.fail(e.getMessage());
            promotionRepository.save(request);

            // Attempt rollback
            rollbackPromotion(promotionRequestId, "Execution failed");
        }
    }

    /**
     * Rollback a promotion.
     */
    public void rollbackPromotion(String promotionRequestId, String reason) {
        PromotionRequestEntity request = getPromotionRequest(promotionRequestId);

        // Restore previous configuration values
        rollbackConfigurationChanges(request);

        request.rollback(reason);
        promotionRepository.save(request);

        logger.info("Rolled back promotion: {}", promotionRequestId);
    }

    // ==================== Diff Engine ====================

    /**
     * Get configuration diff summary.
     */
    public DiffSummary getDiffSummary(String promotionRequestId) {
        List<PromotionDiffEntity> diffs = promotionRepository.findByIdWithDiffs(
            PromotionRequestId.of(promotionRequestId)
        ).map(PromotionRequestEntity::getDiffs)
        .orElse(new ArrayList<>());

        long newCount = diffs.stream().filter(d -> d.getChangeType() == PromotionDiffEntity.ChangeType.NEW).count();
        long modifiedCount = diffs.stream().filter(d -> d.getChangeType() == PromotionDiffEntity.ChangeType.MODIFIED).count();
        long deletedCount = diffs.stream().filter(d -> d.getChangeType() == PromotionDiffEntity.ChangeType.DELETED).count();
        long sameCount = diffs.stream().filter(d -> d.getChangeType() == PromotionDiffEntity.ChangeType.SAME).count();

        return new DiffSummary(diffs.size(), newCount, modifiedCount, deletedCount, sameCount);
    }

    // ==================== Helper Methods ====================

    private PromotionRequestEntity getPromotionRequest(String promotionRequestId) {
        return promotionRepository.findById(PromotionRequestId.of(promotionRequestId))
            .orElseThrow(() -> new ResourceNotFoundException(
                "Promotion request not found: " + promotionRequestId
            ));
    }

    private PromotionRequestEntity getPromotionRequestWithDiffs(String promotionRequestId) {
        return promotionRepository.findByIdWithDiffs(PromotionRequestId.of(promotionRequestId))
            .orElseThrow(() -> new ResourceNotFoundException(
                "Promotion request not found: " + promotionRequestId
            ));
    }

    private Map<String, ConfigurationDiff> getConfigurations(String applicationId, String environmentId) {
        // Fetch configurations from the environment
        Map<String, String> configMap = configQueryService.getConfigurationMap(environmentId);

        Map<String, ConfigurationDiff> configs = new HashMap<>();

        // TODO: Need to get version numbers from configuration entities
        // For now, we'll use version 1 for all
        configMap.forEach((key, value) -> {
            configs.put(key, new ConfigurationDiff(value, "STRING", 1));
        });

        return configs;
    }

    private void applyConfigurationChanges(PromotionRequestEntity request) {
        List<PromotionDiffEntity> diffs = request.getDiffs();

        for (PromotionDiffEntity diff : diffs) {
            if (diff.getChangeType() == PromotionDiffEntity.ChangeType.NEW ||
                diff.getChangeType() == PromotionDiffEntity.ChangeType.MODIFIED) {

                // Update or create configuration in target environment
                // TODO: Call ConfigurationCommandService to update/create
                logger.debug("Applying config: {} = {} (type: {})",
                    diff.getConfigKey(), diff.getSourceValue(), diff.getSourceType());

            } else if (diff.getChangeType() == PromotionDiffEntity.ChangeType.DELETED) {
                // Delete configuration from target environment
                // TODO: Call ConfigurationCommandService to delete
                logger.debug("Deleting config: {}", diff.getConfigKey());
            }
        }
    }

    private void rollbackConfigurationChanges(PromotionRequestEntity request) {
        List<PromotionDiffEntity> diffs = request.getDiffs();

        for (PromotionDiffEntity diff : diffs) {
            if (diff.getChangeType() == PromotionDiffEntity.ChangeType.NEW) {
                // New configs were added - delete them
                // TODO: Delete configuration from target
                logger.debug("Rolling back new config: {}", diff.getConfigKey());

            } else if (diff.getChangeType() == PromotionDiffEntity.ChangeType.MODIFIED) {
                // Modified configs - restore target value
                // TODO: Update configuration with target value
                logger.debug("Rolling back modified config: {} to {}",
                    diff.getConfigKey(), diff.getTargetValue());

            } else if (diff.getChangeType() == PromotionDiffEntity.ChangeType.DELETED) {
                // Deleted configs - recreate them
                // TODO: Create configuration with target value
                logger.debug("Rolling back deleted config: {}", diff.getConfigKey());
            }
        }
    }

    private boolean runSmokeTests(PromotionRequestEntity request) {
        logger.info("Running smoke tests for promotion: {}", request.getId().id());

        // TODO: Implement actual smoke tests
        // For now, simulate success
        try {
            // Simulate smoke test execution
            Thread.sleep(1000);

            // 90% success rate
            boolean passed = Math.random() > 0.1;

            String result = passed ? "PASSED" : "FAILED";
            request.setSmokeTestResult("{\"status\":\"" + result + "\"}");

            return passed;

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return false;
        }
    }

    // ==================== Query Methods ====================

    public PromotionRequestEntity getPromotionRequestEntity(String promotionRequestId) {
        return getPromotionRequest(promotionRequestId);
    }

    public PromotionRequestEntity getPromotionRequestWithDiffsEntity(String promotionRequestId) {
        return getPromotionRequestWithDiffs(promotionRequestId);
    }

    public List<PromotionRequestEntity> findByApplicationId(String applicationId) {
        return promotionRepository.findByApplicationId(applicationId);
    }

    public List<PromotionRequestEntity> findByApplicationIdAndStatus(
            String applicationId,
            PromotionRequestEntity.PromotionStatus status) {
        return promotionRepository.findByApplicationIdAndStatus(applicationId, status);
    }

    public List<PromotionRequestEntity> findByStatus(PromotionRequestEntity.PromotionStatus status) {
        return promotionRepository.findByStatus(status);
    }

    public List<PromotionRequestEntity> findAllPromotionRequests() {
        return promotionRepository.findAll();
    }

    public List<PromotionRequestEntity> findRecentPromotions(int limit) {
        List<PromotionRequestEntity> all = promotionRepository.findRecent();
        return all.stream()
            .limit(limit)
            .toList();
    }

    public long countByStatus(PromotionRequestEntity.PromotionStatus status) {
        return promotionRepository.countByStatus(status);
    }

    public List<PromotionDiffEntity> getDiffs(String promotionRequestId) {
        return promotionRepository.findByIdWithDiffs(PromotionRequestId.of(promotionRequestId))
            .map(PromotionRequestEntity::getDiffs)
            .orElse(new ArrayList<>());
    }

    // ==================== Record Classes ====================

    private record ConfigurationDiff(
        String value,
        String type,
        Integer version
    ) {}

    public record DiffSummary(
        long total,
        long newConfigs,
        long modified,
        long deleted,
        long same
    ) {}
}
