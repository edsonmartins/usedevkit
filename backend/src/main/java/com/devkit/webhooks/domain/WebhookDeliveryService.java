package com.devkit.webhooks.domain;

import com.devkit.shared.domain.SpringEventPublisher;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Service for delivering webhook events with retry logic.
 */
@Service
@Transactional
public class WebhookDeliveryService {

    private static final Logger logger = LoggerFactory.getLogger(WebhookDeliveryService.class);

    private final WebhookRepository webhookRepository;
    private final WebhookDeliveryRepository deliveryRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final SpringEventPublisher eventPublisher;

    public WebhookDeliveryService(
            WebhookRepository webhookRepository,
            WebhookDeliveryRepository deliveryRepository,
            RestTemplate restTemplate,
            ObjectMapper objectMapper,
            SpringEventPublisher eventPublisher) {
        this.webhookRepository = webhookRepository;
        this.deliveryRepository = deliveryRepository;
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
        this.eventPublisher = eventPublisher;
    }

    // ==================== Webhook Management ====================

    /**
     * Create a new webhook.
     */
    public Long createWebhook(
            String name,
            String url,
            String description,
            String applicationId,
            List<WebhookEntity.WebhookEventType> subscribedEvents,
            String secretKey) {

        WebhookEntity webhook = WebhookEntity.create(
            name,
            url,
            description,
            applicationId,
            subscribedEvents,
            secretKey
        );

        WebhookEntity saved = webhookRepository.save(webhook);

        logger.info("Created webhook: {} for URL: {}", name, url);

        return saved.getId();
    }

    /**
     * Update a webhook.
     */
    public void updateWebhook(
            Long webhookId,
            String name,
            String url,
            String description,
            List<WebhookEntity.WebhookEventType> subscribedEvents,
            String secretKey) {

        WebhookEntity webhook = getWebhook(webhookId);

        webhook.setName(name);
        webhook.setUrl(url);
        webhook.setDescription(description);
        webhook.updateSubscribedEvents(subscribedEvents);
        webhook.setSecretKey(secretKey);

        webhookRepository.save(webhook);

        logger.info("Updated webhook: {}", webhookId);
    }

    /**
     * Activate a webhook.
     */
    public void activateWebhook(Long webhookId) {
        WebhookEntity webhook = getWebhook(webhookId);
        webhook.activate();
        webhookRepository.save(webhook);

        logger.info("Activated webhook: {}", webhookId);
    }

    /**
     * Deactivate a webhook.
     */
    public void deactivateWebhook(Long webhookId) {
        WebhookEntity webhook = getWebhook(webhookId);
        webhook.deactivate();
        webhookRepository.save(webhook);

        logger.info("Deactivated webhook: {}", webhookId);
    }

    /**
     * Delete a webhook.
     */
    public void deleteWebhook(Long webhookId) {
        WebhookEntity webhook = getWebhook(webhookId);
        webhookRepository.delete(webhook);

        logger.info("Deleted webhook: {}", webhookId);
    }

    // ==================== Event Delivery ====================

    /**
     * Trigger an event to all subscribed webhooks.
     */
    public void triggerEvent(
            WebhookEntity.WebhookEventType eventType,
            String applicationId,
            Map<String, Object> payload) {

        List<WebhookEntity> webhooks = webhookRepository.findByStatus(WebhookEntity.WebhookStatus.ACTIVE);

        for (WebhookEntity webhook : webhooks) {
            // Filter by application ID if specified
            if (webhook.getApplicationId() != null &&
                !webhook.getApplicationId().equals(applicationId)) {
                continue;
            }

            // Check if webhook is subscribed to this event
            if (!webhook.isSubscribedTo(eventType)) {
                continue;
            }

            // Deliver event asynchronously
            deliverEvent(webhook, eventType.name(), payload);
        }
    }

    /**
     * Deliver an event to a specific webhook.
     */
    public void deliverEvent(
            WebhookEntity webhook,
            String eventType,
            Map<String, Object> payload) {

        try {
            // Generate unique event ID
            String eventId = UUID.randomUUID().toString();

            // Add metadata to payload
            Map<String, Object> fullPayload = new HashMap<>(payload);
            fullPayload.put("event_id", eventId);
            fullPayload.put("event_type", eventType);
            fullPayload.put("timestamp", Instant.now().toString());
            fullPayload.put("webhook_id", webhook.getId());

            // Serialize payload
            String payloadJson = objectMapper.writeValueAsString(fullPayload);

            // Create initial delivery
            WebhookDeliveryEntity delivery = WebhookDeliveryEntity.createInitialDelivery(
                webhook,
                eventType,
                eventId,
                payloadJson
            );

            deliveryRepository.save(delivery);

            // Execute delivery
            executeDelivery(delivery);

        } catch (Exception e) {
            logger.error("Failed to deliver event to webhook: {}", webhook.getId(), e);
        }
    }

    /**
     * Execute a webhook delivery.
     */
    private void executeDelivery(WebhookDeliveryEntity delivery) {
        WebhookEntity webhook = delivery.getWebhook();

        try {
            long startTime = System.currentTimeMillis();

            // Prepare headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("X-Webhook-Event", delivery.getEventType());
            headers.set("X-Webhook-ID", delivery.getEventId());
            headers.set("X-Webhook-Delivery-ID", delivery.getId().toString());
            headers.set("User-Agent", "ConfigHub-Webhook/1.0");

            // Add signature if secret key is configured
            if (webhook.getSecretKey() != null && !webhook.getSecretKey().isEmpty()) {
                String signature = generateSignature(delivery.getPayload(), webhook.getSecretKey());
                headers.set("X-Webhook-Signature", signature);
            }

            // Create request
            HttpEntity<String> request = new HttpEntity<>(delivery.getPayload(), headers);

            // Execute request
            ResponseEntity<String> response = restTemplate.exchange(
                webhook.getUrl(),
                HttpMethod.POST,
                request,
                String.class
            );

            long duration = System.currentTimeMillis() - startTime;

            // Mark as delivered
            delivery.markAsDelivered(
                response.getStatusCode().value(),
                response.getBody(),
                response.getHeaders().toString(),
                duration
            );

            // Update webhook stats
            webhook.recordSuccess();

            deliveryRepository.save(delivery);
            webhookRepository.save(webhook);

            logger.info("Successfully delivered webhook: {} for event: {}",
                webhook.getId(), delivery.getEventType());

        } catch (HttpClientErrorException | HttpServerErrorException e) {
            // HTTP error (4xx, 5xx)
            delivery.markAsFailed(e.getMessage());
            deliveryRepository.save(delivery);
            webhook.recordFailure();
            webhookRepository.save(webhook);

            logger.warn("Webhook delivery failed with HTTP error: {} - {}",
                webhook.getId(), e.getMessage());

            // Schedule retry if applicable
            if (delivery.shouldRetry(webhook.getMaxRetryAttempts())) {
                scheduleRetry(delivery, webhook);
            }

        } catch (ResourceAccessException e) {
            // Connection timeout, DNS error, etc.
            delivery.markAsFailed(e.getMessage());
            deliveryRepository.save(delivery);
            webhook.recordFailure();
            webhookRepository.save(webhook);

            logger.warn("Webhook delivery failed with connection error: {} - {}",
                webhook.getId(), e.getMessage());

            // Schedule retry if applicable
            if (delivery.shouldRetry(webhook.getMaxRetryAttempts())) {
                scheduleRetry(delivery, webhook);
            }

        } catch (Exception e) {
            // Other errors
            delivery.markAsFailed(e.getMessage());
            deliveryRepository.save(delivery);
            webhook.recordFailure();
            webhookRepository.save(webhook);

            logger.error("Webhook delivery failed: {}", webhook.getId(), e);

            // Schedule retry if applicable
            if (delivery.shouldRetry(webhook.getMaxRetryAttempts())) {
                scheduleRetry(delivery, webhook);
            }
        }
    }

    /**
     * Schedule a retry for a failed delivery.
     */
    private void scheduleRetry(WebhookDeliveryEntity failedDelivery, WebhookEntity webhook) {
        Instant nextRetryAt = Instant.now().plusSeconds(webhook.getRetryIntervalSeconds());

        failedDelivery.scheduleRetry(nextRetryAt);
        deliveryRepository.save(failedDelivery);

        logger.info("Scheduled retry for webhook: {} at attempt {}",
            webhook.getId(), failedDelivery.getAttemptNumber() + 1);
    }

    /**
     * Generate HMAC signature for webhook payload.
     */
    private String generateSignature(String payload, String secretKey) {
        try {
            javax.crypto.Mac mac = javax.crypto.Mac.getInstance("HmacSHA256");
            javax.crypto.spec.SecretKeySpec secretKeySpec = new javax.crypto.spec.SecretKeySpec(
                secretKey.getBytes(), "HmacSHA256"
            );
            mac.init(secretKeySpec);
            byte[] hash = mac.doFinal(payload.getBytes());
            return "sha256=" + java.util.Base64.getEncoder().encodeToString(hash);
        } catch (Exception e) {
            logger.error("Failed to generate signature", e);
            return "";
        }
    }

    // ==================== Retry Processing ====================

    /**
     * Process pending retries (scheduled task).
     */
    @Scheduled(fixedDelay = 60000) // Every minute
    public void processPendingRetries() {
        List<WebhookDeliveryEntity> pendingDeliveries = deliveryRepository.findPendingRetries(Instant.now());

        logger.info("Processing {} pending webhook retries", pendingDeliveries.size());

        for (WebhookDeliveryEntity delivery : pendingDeliveries) {
            WebhookEntity webhook = delivery.getWebhook();

            // Skip if webhook is disabled
            if (!webhook.isActive()) {
                continue;
            }

            // Create retry delivery
            WebhookDeliveryEntity retryDelivery = WebhookDeliveryEntity.createRetryDelivery(delivery);
            deliveryRepository.save(retryDelivery);

            // Execute retry
            executeDelivery(retryDelivery);
        }
    }

    // ==================== Query Methods ====================

    public WebhookEntity getWebhook(Long webhookId) {
        return webhookRepository.findById(webhookId)
            .orElseThrow(() -> new IllegalArgumentException(
                "Webhook not found: " + webhookId
            ));
    }

    public List<WebhookEntity> getAllWebhooks() {
        return webhookRepository.findAll();
    }

    public List<WebhookEntity> getActiveWebhooks() {
        return webhookRepository.findByStatus(WebhookEntity.WebhookStatus.ACTIVE);
    }

    public List<WebhookDeliveryEntity> getWebhookDeliveries(Long webhookId) {
        return deliveryRepository.findByWebhookId(webhookId);
    }

    public List<WebhookDeliveryEntity> getRecentDeliveries() {
        return deliveryRepository.findRecent();
    }

    /**
     * Retry a failed delivery immediately.
     */
    public void retryDelivery(Long deliveryId) {
        WebhookDeliveryEntity delivery = deliveryRepository.findById(deliveryId)
            .orElseThrow(() -> new IllegalArgumentException("Delivery not found: " + deliveryId));

        if (delivery.getStatus() != WebhookDeliveryEntity.DeliveryStatus.FAILED) {
            throw new IllegalStateException("Only failed deliveries can be retried");
        }

        WebhookDeliveryEntity retryDelivery = WebhookDeliveryEntity.createRetryDelivery(delivery);
        deliveryRepository.save(retryDelivery);
        executeDelivery(retryDelivery);
    }

    public WebhookStatsDTO getStatistics() {
        long activeCount = webhookRepository.countByStatus(WebhookEntity.WebhookStatus.ACTIVE);
        long inactiveCount = webhookRepository.countByStatus(WebhookEntity.WebhookStatus.INACTIVE);
        long disabledCount = webhookRepository.countByStatus(WebhookEntity.WebhookStatus.DISABLED);

        long pendingDeliveries = deliveryRepository.countByStatus(WebhookDeliveryEntity.DeliveryStatus.PENDING);
        long retryingDeliveries = deliveryRepository.countByStatus(WebhookDeliveryEntity.DeliveryStatus.RETRYING);
        long deliveredCount = deliveryRepository.countByStatus(WebhookDeliveryEntity.DeliveryStatus.DELIVERED);
        long failedCount = deliveryRepository.countByStatus(WebhookDeliveryEntity.DeliveryStatus.FAILED);

        return new WebhookStatsDTO(
            activeCount,
            inactiveCount,
            disabledCount,
            pendingDeliveries,
            retryingDeliveries,
            deliveredCount,
            failedCount
        );
    }

    // ==================== Record Classes ====================

    public record WebhookStatsDTO(
        long activeWebhooks,
        long inactiveWebhooks,
        long disabledWebhooks,
        long pendingDeliveries,
        long retryingDeliveries,
        long deliveredCount,
        long failedCount
    ) {}
}
