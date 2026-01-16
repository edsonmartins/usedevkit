package com.devkit.webhooks.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for WebhookEntity.
 */
@Repository
public interface WebhookRepository extends JpaRepository<WebhookEntity, Long> {

    /**
     * Find active webhooks.
     */
    List<WebhookEntity> findByStatus(WebhookEntity.WebhookStatus status);

    /**
     * Find webhooks by application ID.
     */
    List<WebhookEntity> findByApplicationId(String applicationId);

    /**
     * Find active webhooks subscribed to a specific event type.
     */
    @Query("SELECT w FROM WebhookEntity w JOIN w.subscribedEvents e WHERE w.status = 'ACTIVE' AND e = :eventType")
    List<WebhookEntity> findActiveWebhooksSubscribedToEvent(@Param("eventType") WebhookEntity.WebhookEventType eventType);

    /**
     * Find webhooks by name.
     */
    Optional<WebhookEntity> findByName(String name);

    /**
     * Find webhooks that need retry (status is DISABLED but with recent failures).
     */
    @Query("SELECT w FROM WebhookEntity w WHERE w.status = 'DISABLED' AND w.failureCount > 0")
    List<WebhookEntity> findDisabledWebhooksWithFailures();

    /**
     * Count webhooks by status.
     */
    long countByStatus(WebhookEntity.WebhookStatus status);
}
