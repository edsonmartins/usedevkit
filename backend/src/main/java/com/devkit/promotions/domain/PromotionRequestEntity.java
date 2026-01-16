package com.devkit.promotions.domain;

import com.devkit.promotions.domain.vo.PromotionRequestId;
import com.devkit.shared.domain.AssertUtil;
import com.devkit.shared.domain.BaseEntity;
import jakarta.persistence.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * Represents a request to promote configurations from one environment to another.
 */
@Entity
@Table(name = "promotion_requests")
public class PromotionRequestEntity extends BaseEntity {

    public enum PromotionStatus {
        PENDING_APPROVAL,
        APPROVED,
        REJECTED,
        IN_PROGRESS,
        COMPLETED,
        FAILED,
        ROLLED_BACK
    }

    @EmbeddedId
    @AttributeOverride(name = "id", column = @Column(name = "id", nullable = false))
    private PromotionRequestId id;

    @Column(name = "application_id", nullable = false, length = 255)
    private String applicationId;

    @Column(name = "source_environment", nullable = false, length = 100)
    private String sourceEnvironment;

    @Column(name = "target_environment", nullable = false, length = 100)
    private String targetEnvironment;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 30, nullable = false)
    private PromotionStatus status;

    @Column(name = "requested_by", nullable = false, length = 255)
    private String requestedBy;

    @Column(name = "approved_by", length = 255)
    private String approvedBy;

    @Column(name = "approval_reason", columnDefinition = "TEXT")
    private String approvalReason;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "approved_at")
    private Instant approvedAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "include_all_configs", nullable = false)
    private Boolean includeAllConfigs;

    @Column(name = "config_keys", columnDefinition = "TEXT")
    private String configKeys; // JSON array of keys to promote

    @Column(name = "smoke_test_enabled", nullable = false)
    private Boolean smokeTestEnabled;

    @Column(name = "smoke_test_result", columnDefinition = "TEXT")
    private String smokeTestResult; // JSON result

    // Associations
    @OneToMany(mappedBy = "promotionRequest", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PromotionDiffEntity> diffs = new ArrayList<>();

    // Protected no-arg constructor for JPA
    protected PromotionRequestEntity() {}

    // Public constructor
    public PromotionRequestEntity(
            PromotionRequestId id,
            String applicationId,
            String sourceEnvironment,
            String targetEnvironment,
            String requestedBy,
            Boolean includeAllConfigs,
            Boolean smokeTestEnabled) {

        this.id = AssertUtil.requireNotNull(id, "Promotion request id cannot be null");
        this.applicationId = AssertUtil.requireNotBlank(applicationId, "Application ID cannot be null or empty");
        this.sourceEnvironment = AssertUtil.requireNotBlank(sourceEnvironment, "Source environment cannot be null or empty");
        this.targetEnvironment = AssertUtil.requireNotBlank(targetEnvironment, "Target environment cannot be null or empty");
        this.requestedBy = AssertUtil.requireNotBlank(requestedBy, "Requested by cannot be null or empty");
        this.includeAllConfigs = includeAllConfigs != null ? includeAllConfigs : false;
        this.smokeTestEnabled = smokeTestEnabled != null ? smokeTestEnabled : false;
        this.status = PromotionStatus.PENDING_APPROVAL;
        this.createdAt = Instant.now();
    }

    // Factory method
    public static PromotionRequestEntity create(
            String applicationId,
            String sourceEnvironment,
            String targetEnvironment,
            String requestedBy,
            Boolean includeAllConfigs,
            Boolean smokeTestEnabled) {

        return new PromotionRequestEntity(
                PromotionRequestId.generate(),
                applicationId,
                sourceEnvironment,
                targetEnvironment,
                requestedBy,
                includeAllConfigs,
                smokeTestEnabled
        );
    }

    // Domain methods
    public void approve(String approvedBy, String reason) {
        if (status != PromotionStatus.PENDING_APPROVAL) {
            throw new IllegalStateException("Can only approve pending requests");
        }

        this.status = PromotionStatus.APPROVED;
        this.approvedBy = approvedBy;
        this.approvalReason = reason;
        this.approvedAt = Instant.now();
    }

    public void reject(String rejectedBy, String reason) {
        if (status != PromotionStatus.PENDING_APPROVAL) {
            throw new IllegalStateException("Can only reject pending requests");
        }

        this.status = PromotionStatus.REJECTED;
        this.approvedBy = rejectedBy;
        this.rejectionReason = reason;
    }

    public void startPromotion() {
        if (status != PromotionStatus.APPROVED) {
            throw new IllegalStateException("Can only start approved promotions");
        }

        this.status = PromotionStatus.IN_PROGRESS;
    }

    public void complete() {
        if (status != PromotionStatus.IN_PROGRESS) {
            throw new IllegalStateException("Can only complete in-progress promotions");
        }

        this.status = PromotionStatus.COMPLETED;
        this.completedAt = Instant.now();
    }

    public void fail(String errorMessage) {
        this.status = PromotionStatus.FAILED;
        this.errorMessage = errorMessage;
    }

    public void rollback(String reason) {
        if (status != PromotionStatus.COMPLETED) {
            throw new IllegalStateException("Can only rollback completed promotions");
        }

        this.status = PromotionStatus.ROLLED_BACK;
        this.errorMessage = "Rolled back: " + reason;
    }

    public boolean isPending() {
        return status == PromotionStatus.PENDING_APPROVAL;
    }

    public boolean isApproved() {
        return status == PromotionStatus.APPROVED;
    }

    public boolean isCompleted() {
        return status == PromotionStatus.COMPLETED;
    }

    public boolean isFailed() {
        return status == PromotionStatus.FAILED;
    }

    // Getters
    public PromotionRequestId getId() {
        return id;
    }

    public String getApplicationId() {
        return applicationId;
    }

    public String getSourceEnvironment() {
        return sourceEnvironment;
    }

    public String getTargetEnvironment() {
        return targetEnvironment;
    }

    public PromotionStatus getStatus() {
        return status;
    }

    public String getRequestedBy() {
        return requestedBy;
    }

    public String getApprovedBy() {
        return approvedBy;
    }

    public String getApprovalReason() {
        return approvalReason;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getApprovedAt() {
        return approvedAt;
    }

    public Instant getCompletedAt() {
        return completedAt;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public Boolean getIncludeAllConfigs() {
        return includeAllConfigs;
    }

    public String getConfigKeys() {
        return configKeys;
    }

    public Boolean getSmokeTestEnabled() {
        return smokeTestEnabled;
    }

    public String getSmokeTestResult() {
        return smokeTestResult;
    }

    public List<PromotionDiffEntity> getDiffs() {
        return diffs;
    }

    // Setters
    public void setConfigKeys(String configKeys) {
        this.configKeys = configKeys;
    }

    public void setSmokeTestResult(String smokeTestResult) {
        this.smokeTestResult = smokeTestResult;
    }
}
