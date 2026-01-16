package com.devkit.featureFlags.domain;

import com.devkit.shared.domain.AssertUtil;
import com.devkit.shared.domain.BaseEntity;
import jakarta.persistence.*;

/**
 * Represents a Variant for A/B Testing in Feature Flags.
 * Allows testing different implementations of a feature.
 */
@Entity
@Table(name = "feature_flag_variants")
public class FeatureFlagVariantEntity extends BaseEntity {

    @Column(name = "id", nullable = false)
    private String id;

    @Column(name = "key", nullable = false, length = 100)
    private String key;

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "rollout_percentage", nullable = false)
    private Integer rolloutPercentage;

    @Column(name = "payload", columnDefinition = "TEXT")
    private String payload;

    @Column(name = "is_control", nullable = false)
    private Boolean isControl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "feature_flag_id", nullable = false)
    private FeatureFlagEntity featureFlag;

    // Protected no-arg constructor for JPA
    protected FeatureFlagVariantEntity() {}

    // Public constructor
    public FeatureFlagVariantEntity(
            String id,
            String key,
            String name,
            String description,
            Integer rolloutPercentage,
            String payload,
            Boolean isControl,
            FeatureFlagEntity featureFlag) {

        this.id = AssertUtil.requireNotBlank(id, "Variant id cannot be null or empty");
        this.key = AssertUtil.requireNotBlank(key, "Variant key cannot be null or empty");
        this.name = AssertUtil.requireNotBlank(name, "Variant name cannot be null or empty");
        this.description = description;
        this.rolloutPercentage = AssertUtil.requireNotNull(rolloutPercentage, "Rollout percentage cannot be null");
        this.payload = payload;
        this.isControl = isControl != null ? isControl : false;
        this.featureFlag = AssertUtil.requireNotNull(featureFlag, "Feature flag cannot be null");

        if (rolloutPercentage < 0 || rolloutPercentage > 100) {
            throw new IllegalArgumentException("Rollout percentage must be between 0 and 100");
        }
    }

    // Factory method
    public static FeatureFlagVariantEntity create(
            String key,
            String name,
            String description,
            Integer rolloutPercentage,
            String payload,
            Boolean isControl,
            FeatureFlagEntity featureFlag) {

        return new FeatureFlagVariantEntity(
                com.devkit.shared.domain.IdGenerator.generateString(),
                key,
                name,
                description,
                rolloutPercentage,
                payload,
                isControl,
                featureFlag
        );
    }

    // Domain methods
    public void updateRolloutPercentage(Integer percentage) {
        if (percentage < 0 || percentage > 100) {
            throw new IllegalArgumentException("Rollout percentage must be between 0 and 100");
        }
        this.rolloutPercentage = percentage;
    }

    // Getters
    public String getId() {
        return id;
    }

    public String getKey() {
        return key;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public Integer getRolloutPercentage() {
        return rolloutPercentage;
    }

    public String getPayload() {
        return payload;
    }

    public Boolean isControl() {
        return isControl;
    }

    public FeatureFlagEntity getFeatureFlag() {
        return featureFlag;
    }
}
