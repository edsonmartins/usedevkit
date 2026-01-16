package com.devkit.featureFlags.domain;

import com.devkit.shared.domain.ResourceNotFoundException;
import com.devkit.shared.domain.SpringEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

/**
 * Command Service for Feature Flag write operations.
 */
@Service
@Transactional
public class FeatureFlagCommandService {

    private final FeatureFlagRepository featureFlagRepository;
    private final SpringEventPublisher eventPublisher;

    FeatureFlagCommandService(
            FeatureFlagRepository featureFlagRepository,
            SpringEventPublisher eventPublisher) {
        this.featureFlagRepository = featureFlagRepository;
        this.eventPublisher = eventPublisher;
    }

    /**
     * Create a new feature flag.
     * @param cmd the command containing feature flag details
     * @return the ID of the created feature flag
     */
    public String createFeatureFlag(CreateFeatureFlagCmd cmd) {
        // Check if feature flag with same key already exists
        featureFlagRepository.findByApplicationIdAndKey(cmd.applicationId(), cmd.key())
                .ifPresent(existing -> {
                    throw new IllegalArgumentException(
                            "Feature flag with key '" + cmd.key() + "' already exists");
                });

        var status = cmd.status() != null ?
                FlagStatus.valueOf(cmd.status().toUpperCase()) : FlagStatus.DISABLED;

        var strategy = cmd.rolloutStrategy() != null ?
                RolloutStrategy.valueOf(cmd.rolloutStrategy().toUpperCase()) : RolloutStrategy.ALL;

        var featureFlag = new FeatureFlagEntity(
                FeatureFlagId.generate(),
                cmd.key(),
                cmd.name(),
                cmd.description(),
                status,
                strategy,
                cmd.rolloutPercentage(),
                cmd.targetingRules(),
                cmd.applicationId()
        );

        featureFlagRepository.save(featureFlag);
        eventPublisher.publish(new FeatureFlagCreatedEvent(
                featureFlag.getId().id(),
                featureFlag.getKey(),
                featureFlag.getName(),
                featureFlag.getApplicationId()
        ));

        return featureFlag.getId().id();
    }

    /**
     * Update an existing feature flag.
     * @param cmd the command containing updated feature flag details
     */
    public void updateFeatureFlag(UpdateFeatureFlagCmd cmd) {
        var featureFlag = featureFlagRepository.findById(
                        com.devkit.featureFlags.domain.vo.FeatureFlagId.of(cmd.featureFlagId()))
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Feature flag not found with id: " + cmd.featureFlagId()));

        if (cmd.name() != null && !cmd.name().isBlank()) {
            featureFlag.setName(cmd.name());
        }

        if (cmd.description() != null) {
            // Precisamos adicionar um setter na entidade
            // featureFlag.setDescription(cmd.description());
        }

        if (cmd.status() != null) {
            var status = FlagStatus.valueOf(cmd.status().toUpperCase());
            if (status == FlagStatus.ENABLED) {
                featureFlag.enable();
            } else if (status == FlagStatus.DISABLED) {
                featureFlag.disable();
            }
        }

        if (cmd.rolloutPercentage() != null) {
            featureFlag.setRolloutPercentage(cmd.rolloutPercentage());
        }

        if (cmd.targetingRules() != null) {
            featureFlag.setTargetingRules(cmd.targetingRules());
        }

        featureFlagRepository.save(featureFlag);
        eventPublisher.publish(new FeatureFlagUpdatedEvent(
                featureFlag.getId().id(),
                featureFlag.getKey()
        ));
    }

    /**
     * Enable a feature flag.
     * @param featureFlagId the ID of the feature flag to enable
     */
    public void enableFeatureFlag(String featureFlagId) {
        var featureFlag = featureFlagRepository.findById(
                        com.devkit.featureFlags.domain.vo.FeatureFlagId.of(featureFlagId))
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Feature flag not found with id: " + featureFlagId));

        featureFlag.enable();
        featureFlagRepository.save(featureFlag);
        eventPublisher.publish(new FeatureFlagEnabledEvent(
                featureFlag.getId().id(),
                featureFlag.getKey()
        ));
    }

    /**
     * Disable a feature flag.
     * @param featureFlagId the ID of the feature flag to disable
     */
    public void disableFeatureFlag(String featureFlagId) {
        var featureFlag = featureFlagRepository.findById(
                        com.devkit.featureFlags.domain.vo.FeatureFlagId.of(featureFlagId))
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Feature flag not found with id: " + featureFlagId));

        featureFlag.disable();
        featureFlagRepository.save(featureFlag);
        eventPublisher.publish(new FeatureFlagDisabledEvent(
                featureFlag.getId().id(),
                featureFlag.getKey()
        ));
    }

    /**
     * Delete a feature flag.
     * @param featureFlagId the ID of the feature flag to delete
     */
    public void deleteFeatureFlag(String featureFlagId) {
        var featureFlag = featureFlagRepository.findById(
                        com.devkit.featureFlags.domain.vo.FeatureFlagId.of(featureFlagId))
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Feature flag not found with id: " + featureFlagId));

        featureFlagRepository.delete(featureFlag);
        eventPublisher.publish(new FeatureFlagDeletedEvent(
                featureFlag.getId().id(),
                featureFlag.getKey()
        ));
    }
}
