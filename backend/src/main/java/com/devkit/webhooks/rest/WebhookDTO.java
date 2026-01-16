package com.devkit.webhooks.rest;

import com.devkit.webhooks.domain.WebhookEntity;

import java.time.Instant;
import java.util.List;

/**
 * DTO for webhook.
 */
public record WebhookDTO(
    Long id,
    String name,
    String url,
    String description,
    WebhookEntity.WebhookStatus status,
    String applicationId,
    List<WebhookEntity.WebhookEventType> subscribedEvents,
    Integer maxRetryAttempts,
    Integer retryIntervalSeconds,
    Integer timeoutSeconds,
    Instant lastSuccessAt,
    Instant lastFailureAt,
    Integer failureCount,
    Long totalDeliveries,
    Long successfulDeliveries,
    Long failedDeliveries,
    Instant createdAt,
    Instant updatedAt
) {
    public static WebhookDTO fromEntity(WebhookEntity entity) {
        return new WebhookDTO(
            entity.getId(),
            entity.getName(),
            entity.getUrl(),
            entity.getDescription(),
            entity.getStatus(),
            entity.getApplicationId(),
            entity.getSubscribedEvents(),
            entity.getMaxRetryAttempts(),
            entity.getRetryIntervalSeconds(),
            entity.getTimeoutSeconds(),
            entity.getLastSuccessAt(),
            entity.getLastFailureAt(),
            entity.getFailureCount(),
            entity.getTotalDeliveries(),
            entity.getSuccessfulDeliveries(),
            entity.getFailedDeliveries(),
            entity.getCreatedAt(),
            entity.getUpdatedAt()
        );
    }
}
