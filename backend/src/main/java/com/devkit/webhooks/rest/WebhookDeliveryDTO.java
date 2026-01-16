package com.devkit.webhooks.rest;

import com.devkit.webhooks.domain.WebhookDeliveryEntity;

import java.time.Instant;

/**
 * DTO for webhook delivery.
 */
public record WebhookDeliveryDTO(
    Long id,
    Long webhookId,
    String eventType,
    String eventId,
    String payload,
    Integer responseStatusCode,
    String responseBody,
    WebhookDeliveryEntity.DeliveryStatus status,
    Integer attemptNumber,
    Instant deliveredAt,
    Long durationMilliseconds,
    String errorMessage,
    Instant nextRetryAt,
    Instant createdAt
) {
    public static WebhookDeliveryDTO fromEntity(WebhookDeliveryEntity entity) {
        return new WebhookDeliveryDTO(
            entity.getId(),
            entity.getWebhook().getId(),
            entity.getEventType(),
            entity.getEventId(),
            entity.getPayload(),
            entity.getResponseStatusCode(),
            entity.getResponseBody(),
            entity.getStatus(),
            entity.getAttemptNumber(),
            entity.getDeliveredAt(),
            entity.getDurationMilliseconds(),
            entity.getErrorMessage(),
            entity.getNextRetryAt(),
            entity.getCreatedAt()
        );
    }
}
