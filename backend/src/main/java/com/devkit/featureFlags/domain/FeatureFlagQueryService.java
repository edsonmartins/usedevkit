package com.devkit.featureFlags.domain;

import com.devkit.shared.domain.ResourceNotFoundException;
import com.devkit.featureFlags.domain.vo.FeatureFlagId;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Query Service for Feature Flag read operations.
 */
@Service
@Transactional(readOnly = true)
public class FeatureFlagQueryService {

    private final FeatureFlagRepository featureFlagRepository;
    private final FeatureFlagMapper featureFlagMapper;

    FeatureFlagQueryService(
            FeatureFlagRepository featureFlagRepository,
            FeatureFlagMapper featureFlagMapper) {
        this.featureFlagRepository = featureFlagRepository;
        this.featureFlagMapper = featureFlagMapper;
    }

    /**
     * Get all feature flags for an application.
     * @param applicationId the application ID
     * @return list of feature flags
     */
    public List<FeatureFlagResult> getFeatureFlagsByApplication(String applicationId) {
        return featureFlagRepository.findActiveByApplicationId(applicationId)
                .stream()
                .map(featureFlagMapper::toFeatureFlagResult)
                .toList();
    }

    /**
     * Get feature flag by ID.
     * @param featureFlagId the feature flag ID
     * @return the feature flag
     */
    public FeatureFlagResult getFeatureFlagById(String featureFlagId) {
        var featureFlag = featureFlagRepository.findById(FeatureFlagId.of(featureFlagId))
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Feature flag not found with id: " + featureFlagId));
        return featureFlagMapper.toFeatureFlagResult(featureFlag);
    }

    /**
     * Get feature flag by application and key.
     * @param applicationId the application ID
     * @param key the feature flag key
     * @return the feature flag
     */
    public FeatureFlagResult getFeatureFlagByKey(String applicationId, String key) {
        var featureFlag = featureFlagRepository.getByApplicationIdAndKey(applicationId, key);
        return featureFlagMapper.toFeatureFlagResult(featureFlag);
    }

    /**
     * Get enabled feature flags for an application.
     * @param applicationId the application ID
     * @return list of enabled feature flags
     */
    public List<FeatureFlagResult> getEnabledFeatureFlags(String applicationId) {
        return featureFlagRepository.findEnabledByApplicationId(applicationId)
                .stream()
                .map(featureFlagMapper::toFeatureFlagResult)
                .toList();
    }

    /**
     * Get conditional feature flags for an application.
     * @param applicationId the application ID
     * @return list of conditional feature flags
     */
    public List<FeatureFlagResult> getConditionalFeatureFlags(String applicationId) {
        return featureFlagRepository.findConditionalByApplicationId(applicationId)
                .stream()
                .map(featureFlagMapper::toFeatureFlagResult)
                .toList();
    }
}
