package com.devkit.webhooks.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

/**
 * Repository for WebhookDeliveryEntity.
 */
@Repository
public interface WebhookDeliveryRepository extends JpaRepository<WebhookDeliveryEntity, Long> {

    /**
     * Find deliveries by webhook ID.
     */
    List<WebhookDeliveryEntity> findByWebhookId(Long webhookId);

    /**
     * Find deliveries by event ID.
     */
    List<WebhookDeliveryEntity> findByEventId(String eventId);

    /**
     * Find deliveries by status.
     */
    List<WebhookDeliveryEntity> findByStatus(WebhookDeliveryEntity.DeliveryStatus status);

    /**
     * Find pending deliveries that should be retried.
     */
    @Query("SELECT d FROM WebhookDeliveryEntity d WHERE d.status = 'RETRYING' AND d.nextRetryAt <= :now")
    List<WebhookDeliveryEntity> findPendingRetries(@Param("now") Instant now);

    /**
     * Find recent deliveries.
     */
    @Query("SELECT d FROM WebhookDeliveryEntity d ORDER BY d.createdAt DESC")
    List<WebhookDeliveryEntity> findRecent();

    /**
     * Count deliveries by status.
     */
    long countByStatus(WebhookDeliveryEntity.DeliveryStatus status);

    /**
     * Count successful deliveries for a webhook.
     */
    @Query("SELECT COUNT(d) FROM WebhookDeliveryEntity d WHERE d.webhook.id = :webhookId AND d.status = 'DELIVERED'")
    long countSuccessfulDeliveries(@Param("webhookId") Long webhookId);

    /**
     * Count failed deliveries for a webhook.
     */
    @Query("SELECT d.webhook.id, COUNT(d) FROM WebhookDeliveryEntity d WHERE d.status IN ('FAILED', 'TIMEOUT') GROUP BY d.webhook.id")
    List<Object[]> countFailedDeliveriesByWebhook();
}
