package com.devkit.webhooks.domain;

import com.devkit.shared.domain.AssertUtil;
import com.devkit.shared.domain.BaseEntity;
import jakarta.persistence.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * Represents a webhook configuration for receiving notifications about configuration changes.
 */
@Entity
@Table(name = "webhooks")
public class WebhookEntity extends BaseEntity {

    public enum WebhookStatus {
        ACTIVE,       // Webhook is active and receiving events
        INACTIVE,     // Webhook is paused
        DISABLED      // Webhook is disabled due to repeated failures
    }

    public enum WebhookEventType {
        CONFIG_CREATED,
        CONFIG_UPDATED,
        CONFIG_DELETED,
        SECRET_ROTATED,
        PROMOTION_CREATED,
        PROMOTION_APPROVED,
        PROMOTION_EXECUTED,
        PROMOTION_FAILED,
        SECRET_EXPIRED
    }

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "url", nullable = false, length = 500)
    private String url;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20, nullable = false)
    private WebhookStatus status;

    @Column(name = "application_id", length = 255)
    private String applicationId; // Optional: filter events by application

    @ElementCollection
    @CollectionTable(name = "webhook_subscribed_events", joinColumns = @JoinColumn(name = "webhook_id"))
    @Column(name = "event_type", length = 50)
    private List<WebhookEventType> subscribedEvents = new ArrayList<>();

    @Column(name = "secret_key", length = 255)
    private String secretKey; // For HMAC signature

    @Column(name = "retry_policy_max_attempts", nullable = false)
    private Integer maxRetryAttempts = 3;

    @Column(name = "retry_policy_retry_interval_seconds", nullable = false)
    private Integer retryIntervalSeconds = 60;

    @Column(name = "timeout_seconds", nullable = false)
    private Integer timeoutSeconds = 30;

    @Column(name = "last_success_at")
    private Instant lastSuccessAt;

    @Column(name = "last_failure_at")
    private Instant lastFailureAt;

    @Column(name = "failure_count", nullable = false)
    private Integer failureCount = 0;

    @Column(name = "total_deliveries", nullable = false)
    private Long totalDeliveries = 0L;

    @Column(name = "successful_deliveries", nullable = false)
    private Long successfulDeliveries = 0L;

    @Column(name = "failed_deliveries", nullable = false)
    private Long failedDeliveries = 0L;

    // Associations
    @OneToMany(mappedBy = "webhook", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<WebhookDeliveryEntity> deliveries = new ArrayList<>();

    // Protected no-arg constructor for JPA
    protected WebhookEntity() {}

    // Public constructor
    public WebhookEntity(
            String name,
            String url,
            String description,
            String applicationId,
            List<WebhookEventType> subscribedEvents,
            String secretKey,
            Integer maxRetryAttempts,
            Integer retryIntervalSeconds,
            Integer timeoutSeconds) {

        this.name = AssertUtil.requireNotBlank(name, "Webhook name cannot be null or empty");
        this.url = AssertUtil.requireNotBlank(url, "Webhook URL cannot be null or empty");
        this.description = description;
        this.applicationId = applicationId;
        this.subscribedEvents = AssertUtil.requireNotNull(subscribedEvents, "Subscribed events cannot be null");
        this.secretKey = secretKey;
        this.maxRetryAttempts = maxRetryAttempts != null ? maxRetryAttempts : 3;
        this.retryIntervalSeconds = retryIntervalSeconds != null ? retryIntervalSeconds : 60;
        this.timeoutSeconds = timeoutSeconds != null ? timeoutSeconds : 30;
        this.status = WebhookStatus.ACTIVE;
        this.failureCount = 0;
        this.totalDeliveries = 0L;
        this.successfulDeliveries = 0L;
        this.failedDeliveries = 0L;
    }

    // Factory method
    public static WebhookEntity create(
            String name,
            String url,
            String description,
            String applicationId,
            List<WebhookEventType> subscribedEvents,
            String secretKey) {

        return new WebhookEntity(
                name,
                url,
                description,
                applicationId,
                subscribedEvents,
                secretKey,
                3,
                60,
                30
        );
    }

    // Domain methods
    public void activate() {
        this.status = WebhookStatus.ACTIVE;
        this.failureCount = 0;
    }

    public void deactivate() {
        this.status = WebhookStatus.INACTIVE;
    }

    public void disable() {
        this.status = WebhookStatus.DISABLED;
    }

    public void recordSuccess() {
        this.lastSuccessAt = Instant.now();
        this.failureCount = 0;
        this.successfulDeliveries++;
        this.totalDeliveries++;

        // Auto-reactivate if was disabled and now succeeding
        if (this.status == WebhookStatus.DISABLED) {
            this.status = WebhookStatus.ACTIVE;
        }
    }

    public void recordFailure() {
        this.lastFailureAt = Instant.now();
        this.failureCount++;
        this.failedDeliveries++;
        this.totalDeliveries++;

        // Auto-disable if too many failures
        if (this.failureCount >= this.maxRetryAttempts) {
            this.status = WebhookStatus.DISABLED;
        }
    }

    public boolean isSubscribedTo(WebhookEventType eventType) {
        return subscribedEvents.contains(eventType);
    }

    public boolean isActive() {
        return status == WebhookStatus.ACTIVE;
    }

    public void updateSubscribedEvents(List<WebhookEventType> events) {
        this.subscribedEvents = AssertUtil.requireNotNull(events, "Subscribed events cannot be null");
    }

    // Getters
    public String getName() {
        return name;
    }

    public String getUrl() {
        return url;
    }

    public String getDescription() {
        return description;
    }

    public WebhookStatus getStatus() {
        return status;
    }

    public String getApplicationId() {
        return applicationId;
    }

    public List<WebhookEventType> getSubscribedEvents() {
        return subscribedEvents;
    }

    public String getSecretKey() {
        return secretKey;
    }

    public Integer getMaxRetryAttempts() {
        return maxRetryAttempts;
    }

    public Integer getRetryIntervalSeconds() {
        return retryIntervalSeconds;
    }

    public Integer getTimeoutSeconds() {
        return timeoutSeconds;
    }

    public Instant getLastSuccessAt() {
        return lastSuccessAt;
    }

    public Instant getLastFailureAt() {
        return lastFailureAt;
    }

    public Integer getFailureCount() {
        return failureCount;
    }

    public Long getTotalDeliveries() {
        return totalDeliveries;
    }

    public Long getSuccessfulDeliveries() {
        return successfulDeliveries;
    }

    public Long getFailedDeliveries() {
        return failedDeliveries;
    }

    public List<WebhookDeliveryEntity> getDeliveries() {
        return deliveries;
    }

    // Setters
    public void setName(String name) {
        this.name = name;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setSecretKey(String secretKey) {
        this.secretKey = secretKey;
    }

    public void setMaxRetryAttempts(Integer maxRetryAttempts) {
        this.maxRetryAttempts = maxRetryAttempts;
    }

    public void setRetryIntervalSeconds(Integer retryIntervalSeconds) {
        this.retryIntervalSeconds = retryIntervalSeconds;
    }

    public void setTimeoutSeconds(Integer timeoutSeconds) {
        this.timeoutSeconds = timeoutSeconds;
    }
}
