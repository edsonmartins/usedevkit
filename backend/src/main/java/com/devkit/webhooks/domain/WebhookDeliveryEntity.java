package com.devkit.webhooks.domain;

import com.devkit.shared.domain.AssertUtil;
import com.devkit.shared.domain.BaseEntity;
import jakarta.persistence.*;

import java.time.Instant;

/**
 * Represents a delivery attempt for a webhook event.
 */
@Entity
@Table(name = "webhook_deliveries")
public class WebhookDeliveryEntity extends BaseEntity {

    public enum DeliveryStatus {
        PENDING,      // Scheduled for delivery
        DELIVERED,    // Successfully delivered
        FAILED,       // Failed to deliver
        RETRYING,     // Retry in progress
        TIMEOUT       // Request timed out
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false, updatable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "webhook_id", nullable = false)
    private WebhookEntity webhook;

    @Column(name = "event_type", nullable = false, length = 50)
    private String eventType;

    @Column(name = "event_id", length = 255)
    private String eventId; // Unique ID for this event occurrence

    @Column(name = "payload", columnDefinition = "TEXT")
    private String payload; // JSON payload

    @Column(name = "response_status_code")
    private Integer responseStatusCode;

    @Column(name = "response_body", columnDefinition = "TEXT")
    private String responseBody;

    @Column(name = "response_headers", columnDefinition = "TEXT")
    private String responseHeaders;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20, nullable = false)
    private DeliveryStatus status;

    @Column(name = "attempt_number", nullable = false)
    private Integer attemptNumber;

    @Column(name = "delivered_at")
    private Instant deliveredAt;

    @Column(name = "duration_milliseconds")
    private Long durationMilliseconds;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "next_retry_at")
    private Instant nextRetryAt;

    // Protected no-arg constructor for JPA
    protected WebhookDeliveryEntity() {}

    // Public constructor
    public WebhookDeliveryEntity(
            WebhookEntity webhook,
            String eventType,
            String eventId,
            String payload,
            Integer attemptNumber) {

        this.webhook = AssertUtil.requireNotNull(webhook, "Webhook cannot be null");
        this.eventType = AssertUtil.requireNotBlank(eventType, "Event type cannot be null or empty");
        this.eventId = eventId;
        this.payload = payload;
        this.attemptNumber = attemptNumber != null ? attemptNumber : 1;
        this.status = DeliveryStatus.PENDING;
    }

    // Factory methods
    public static WebhookDeliveryEntity createInitialDelivery(
            WebhookEntity webhook,
            String eventType,
            String eventId,
            String payload) {

        return new WebhookDeliveryEntity(webhook, eventType, eventId, payload, 1);
    }

    public static WebhookDeliveryEntity createRetryDelivery(WebhookDeliveryEntity previous) {
        return new WebhookDeliveryEntity(
            previous.webhook,
            previous.eventType,
            previous.eventId,
            previous.payload,
            previous.attemptNumber + 1
        );
    }

    public Long getId() {
        return id;
    }

    // Domain methods
    public void markAsDelivered(int statusCode, String responseBody, String responseHeaders, long duration) {
        this.status = DeliveryStatus.DELIVERED;
        this.responseStatusCode = statusCode;
        this.responseBody = responseBody;
        this.responseHeaders = responseHeaders;
        this.durationMilliseconds = duration;
        this.deliveredAt = Instant.now();
        this.nextRetryAt = null;
    }

    public void markAsFailed(String errorMessage) {
        this.status = DeliveryStatus.FAILED;
        this.errorMessage = errorMessage;
        this.deliveredAt = Instant.now();
    }

    public void markAsTimeout(String errorMessage) {
        this.status = DeliveryStatus.TIMEOUT;
        this.errorMessage = errorMessage;
        this.deliveredAt = Instant.now();
    }

    public void scheduleRetry(Instant nextRetryAt) {
        this.status = DeliveryStatus.RETRYING;
        this.nextRetryAt = nextRetryAt;
    }

    public boolean isSuccess() {
        return status == DeliveryStatus.DELIVERED;
    }

    public boolean isFinalStatus() {
        return status == DeliveryStatus.DELIVERED ||
               status == DeliveryStatus.FAILED ||
               status == DeliveryStatus.TIMEOUT;
    }

    public boolean shouldRetry(int maxAttempts) {
        return !isSuccess() && attemptNumber < maxAttempts;
    }

    // Getters
    public WebhookEntity getWebhook() {
        return webhook;
    }

    public String getEventType() {
        return eventType;
    }

    public String getEventId() {
        return eventId;
    }

    public String getPayload() {
        return payload;
    }

    public Integer getResponseStatusCode() {
        return responseStatusCode;
    }

    public String getResponseBody() {
        return responseBody;
    }

    public String getResponseHeaders() {
        return responseHeaders;
    }

    public DeliveryStatus getStatus() {
        return status;
    }

    public Integer getAttemptNumber() {
        return attemptNumber;
    }

    public Instant getDeliveredAt() {
        return deliveredAt;
    }

    public Long getDurationMilliseconds() {
        return durationMilliseconds;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public Instant getNextRetryAt() {
        return nextRetryAt;
    }

    // Setters
    public void setWebhook(WebhookEntity webhook) {
        this.webhook = webhook;
    }
}
