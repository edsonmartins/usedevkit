package com.devkit.promotions.domain;

import com.devkit.shared.domain.AssertUtil;
import com.devkit.shared.domain.BaseEntity;
import jakarta.persistence.*;

/**
 * Represents a configuration difference between two environments.
 * Used in environment promotion to show what will change.
 */
@Entity
@Table(name = "promotion_diffs")
public class PromotionDiffEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false)
    private String id;

    @Column(name = "promotion_request_id", nullable = false, length = 255)
    private String promotionRequestId;

    @Column(name = "config_key", nullable = false, length = 255)
    private String configKey;

    @Column(name = "source_value", columnDefinition = "TEXT")
    private String sourceValue;

    @Column(name = "target_value", columnDefinition = "TEXT")
    private String targetValue;

    @Column(name = "source_type", length = 20)
    private String sourceType;

    @Column(name = "target_type", length = 20)
    private String targetType;

    @Column(name = "source_version", nullable = false)
    private Integer sourceVersion;

    @Column(name = "target_version", nullable = false)
    private Integer targetVersion;

    @Column(name = "change_type", nullable = false, length = 20)
    private ChangeType changeType;

    // Many-to-One relationship
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "promotion_request_id", insertable = false, updatable = false)
    private PromotionRequestEntity promotionRequest;

    public enum ChangeType {
        NEW,        // Configuration exists in source but not in target
        MODIFIED,   // Configuration exists in both but value is different
        DELETED,    // Configuration exists in target but not in source
        SAME        // Configuration is the same in both
    }

    // Protected no-arg constructor for JPA
    protected PromotionDiffEntity() {}

    // Public constructor
    public PromotionDiffEntity(
            String promotionRequestId,
            String configKey,
            String sourceValue,
            String targetValue,
            String sourceType,
            String targetType,
            Integer sourceVersion,
            Integer targetVersion,
            ChangeType changeType) {

        this.promotionRequestId = AssertUtil.requireNotBlank(promotionRequestId, "Promotion request ID cannot be null or empty");
        this.configKey = AssertUtil.requireNotBlank(configKey, "Config key cannot be null or empty");
        this.sourceValue = sourceValue;
        this.targetValue = targetValue;
        this.sourceType = sourceType;
        this.targetType = targetType;
        this.sourceVersion = AssertUtil.requireNotNull(sourceVersion, "Source version cannot be null");
        this.targetVersion = AssertUtil.requireNotNull(targetVersion, "Target version cannot be null");
        this.changeType = AssertUtil.requireNotNull(changeType, "Change type cannot be null");
    }

    public String getId() {
        return id;
    }

    // Factory methods
    public static PromotionDiffEntity newConfig(
            String promotionRequestId,
            String configKey,
            String sourceValue,
            String sourceType,
            Integer sourceVersion) {

        return new PromotionDiffEntity(
                promotionRequestId,
                configKey,
                sourceValue,
                null,
                sourceType,
                null,
                sourceVersion,
                0,
                ChangeType.NEW
        );
    }

    public static PromotionDiffEntity modifiedConfig(
            String promotionRequestId,
            String configKey,
            String sourceValue,
            String targetValue,
            String sourceType,
            String targetType,
            Integer sourceVersion,
            Integer targetVersion) {

        return new PromotionDiffEntity(
                promotionRequestId,
                configKey,
                sourceValue,
                targetValue,
                sourceType,
                targetType,
                sourceVersion,
                targetVersion,
                ChangeType.MODIFIED
        );
    }

    public static PromotionDiffEntity deletedConfig(
            String promotionRequestId,
            String configKey,
            String targetValue,
            String targetType,
            Integer targetVersion) {

        return new PromotionDiffEntity(
                promotionRequestId,
                configKey,
                null,
                targetValue,
                null,
                targetType,
                0,
                targetVersion,
                ChangeType.DELETED
        );
    }

    public static PromotionDiffEntity sameConfig(
            String promotionRequestId,
            String configKey,
            String value,
            String type,
            Integer version) {

        return new PromotionDiffEntity(
                promotionRequestId,
                configKey,
                value,
                value,
                type,
                type,
                version,
                version,
                ChangeType.SAME
        );
    }

    // Getters
    public String getPromotionRequestId() {
        return promotionRequestId;
    }

    public String getConfigKey() {
        return configKey;
    }

    public String getSourceValue() {
        return sourceValue;
    }

    public String getTargetValue() {
        return targetValue;
    }

    public String getSourceType() {
        return sourceType;
    }

    public String getTargetType() {
        return targetType;
    }

    public Integer getSourceVersion() {
        return sourceVersion;
    }

    public Integer getTargetVersion() {
        return targetVersion;
    }

    public ChangeType getChangeType() {
        return changeType;
    }

    public PromotionRequestEntity getPromotionRequest() {
        return promotionRequest;
    }

    // Setters
    public void setPromotionRequest(PromotionRequestEntity promotionRequest) {
        this.promotionRequest = promotionRequest;
    }
}
