package com.devkit.featureFlags.domain;

import com.devkit.featureFlags.domain.vo.FeatureFlagId;
import com.devkit.shared.domain.AssertUtil;
import com.devkit.shared.domain.BaseEntity;
import jakarta.persistence.*;

import java.util.HashSet;
import java.util.Set;

/**
 * Represents a Feature Flag for controlling feature availability.
 * Supports simple toggle, percentage-based rollout, and complex targeting rules.
 */
@Entity
@Table(name = "feature_flags", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"application_id", "key"})
})
public class FeatureFlagEntity extends BaseEntity {

    public enum FlagStatus {
        ENABLED, DISABLED, CONDITIONAL
    }

    public enum RolloutStrategy {
        ALL, PERCENTAGE, USER_SEGMENT, GRADUAL, TARGETING_RULES
    }

    @EmbeddedId
    @AttributeOverride(name = "id", column = @Column(name = "id", nullable = false))
    private FeatureFlagId id;

    @Column(name = "key", nullable = false, length = 255)
    private String key;

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private FlagStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "rollout_strategy", nullable = false, length = 30)
    private RolloutStrategy rolloutStrategy;

    @Column(name = "rollout_percentage")
    private Integer rolloutPercentage;

    @Column(name = "targeting_rules", columnDefinition = "TEXT")
    private String targetingRules;

    @Column(name = "application_id", nullable = false, length = 255)
    private String applicationId;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive;

    @OneToMany(mappedBy = "featureFlag", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<FeatureFlagVariantEntity> variants = new HashSet<>();

    @Version
    private int version;

    // Protected no-arg constructor for JPA
    protected FeatureFlagEntity() {}

    // Public constructor
    public FeatureFlagEntity(
            FeatureFlagId id,
            String key,
            String name,
            String description,
            FlagStatus status,
            RolloutStrategy rolloutStrategy,
            Integer rolloutPercentage,
            String targetingRules,
            String applicationId) {

        this.id = AssertUtil.requireNotNull(id, "Feature flag id cannot be null");
        this.key = AssertUtil.requireNotBlank(key, "Feature flag key cannot be null or empty");
        this.name = AssertUtil.requireNotBlank(name, "Feature flag name cannot be null or empty");
        this.description = description;
        this.status = AssertUtil.requireNotNull(status, "Status cannot be null");
        this.rolloutStrategy = AssertUtil.requireNotNull(rolloutStrategy, "Rollout strategy cannot be null");
        this.rolloutPercentage = rolloutPercentage;
        this.targetingRules = targetingRules;
        this.applicationId = AssertUtil.requireNotBlank(applicationId, "Application id cannot be null or empty");
        this.isActive = true;

        validateRolloutParameters();
    }

    // Factory method for simple toggle
    public static FeatureFlagEntity createSimpleToggle(
            String key,
            String name,
            String description,
            String applicationId) {

        return new FeatureFlagEntity(
                FeatureFlagId.generate(),
                key,
                name,
                description,
                FlagStatus.DISABLED,
                RolloutStrategy.ALL,
                null,
                null,
                applicationId
        );
    }

    // Factory method for percentage rollout
    public static FeatureFlagEntity createPercentageRollout(
            String key,
            String name,
            String description,
            Integer percentage,
            String applicationId) {

        return new FeatureFlagEntity(
                FeatureFlagId.generate(),
                key,
                name,
                description,
                FlagStatus.CONDITIONAL,
                RolloutStrategy.PERCENTAGE,
                percentage,
                null,
                applicationId
        );
    }

    // Domain methods
    public void enable() {
        this.status = FlagStatus.ENABLED;
    }

    public void disable() {
        this.status = FlagStatus.DISABLED;
    }

    public void archive() {
        this.isActive = false;
    }

    public void updateName(String name) {
        this.name = AssertUtil.requireNotBlank(name, "Feature flag name cannot be null or empty");
    }

    public void updateDescription(String description) {
        this.description = description;
    }

    public void setRolloutPercentage(Integer percentage) {
        if (percentage < 0 || percentage > 100) {
            throw new IllegalArgumentException("Rollout percentage must be between 0 and 100");
        }
        this.rolloutPercentage = percentage;
        this.status = FlagStatus.CONDITIONAL;
        this.rolloutStrategy = RolloutStrategy.PERCENTAGE;
    }

    public void setTargetingRules(String rules) {
        this.targetingRules = rules;
        this.status = FlagStatus.CONDITIONAL;
        this.rolloutStrategy = RolloutStrategy.TARGETING_RULES;
    }

    public void addVariant(FeatureFlagVariantEntity variant) {
        AssertUtil.requireNotNull(variant, "Variant cannot be null");
        this.variants.add(variant);
    }

    public void removeVariant(FeatureFlagVariantEntity variant) {
        this.variants.remove(variant);
    }

    private void validateRolloutParameters() {
        if (rolloutStrategy == RolloutStrategy.PERCENTAGE ||
            rolloutStrategy == RolloutStrategy.GRADUAL) {
            if (rolloutPercentage == null || rolloutPercentage < 0 || rolloutPercentage > 100) {
                throw new IllegalArgumentException("Valid rollout percentage required for percentage-based strategies");
            }
        }
    }

    public boolean isEnabled() {
        return status == FlagStatus.ENABLED || status == FlagStatus.CONDITIONAL;
    }

    // Getters
    public FeatureFlagId getId() {
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

    public FlagStatus getStatus() {
        return status;
    }

    public RolloutStrategy getRolloutStrategy() {
        return rolloutStrategy;
    }

    public Integer getRolloutPercentage() {
        return rolloutPercentage;
    }

    public String getTargetingRules() {
        return targetingRules;
    }

    public String getApplicationId() {
        return applicationId;
    }

    public Boolean isActive() {
        return isActive;
    }

    public Set<FeatureFlagVariantEntity> getVariants() {
        return Set.copyOf(variants);
    }

    public int getVersion() {
        return version;
    }
}
