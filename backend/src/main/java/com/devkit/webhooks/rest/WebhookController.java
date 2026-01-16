package com.devkit.webhooks.rest;

import com.devkit.webhooks.domain.WebhookDeliveryEntity;
import com.devkit.webhooks.domain.WebhookDeliveryService;
import com.devkit.webhooks.domain.WebhookEntity;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST Controller for Webhooks.
 */
@RestController
@RequestMapping("/api/v1/webhooks")
public class WebhookController {

    private static final Logger logger = LoggerFactory.getLogger(WebhookController.class);

    private final WebhookDeliveryService webhookDeliveryService;

    public WebhookController(WebhookDeliveryService webhookDeliveryService) {
        this.webhookDeliveryService = webhookDeliveryService;
    }

    // ==================== Webhook Management ====================

    /**
     * Create a new webhook.
     */
    @PostMapping
    public ResponseEntity<WebhookDTO> createWebhook(@Valid @RequestBody CreateWebhookDTO request) {
        logger.info("Creating webhook: {} for URL: {}", request.name(), request.url());

        Long webhookId = webhookDeliveryService.createWebhook(
            request.name(),
            request.url(),
            request.description(),
            request.applicationId(),
            request.subscribedEvents(),
            request.secretKey()
        );

        WebhookEntity webhook = webhookDeliveryService.getWebhook(webhookId);

        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(WebhookDTO.fromEntity(webhook));
    }

    /**
     * Get a webhook by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<WebhookDTO> getWebhook(@PathVariable Long id) {
        logger.debug("Getting webhook: {}", id);

        WebhookEntity webhook = webhookDeliveryService.getWebhook(id);

        return ResponseEntity.ok(WebhookDTO.fromEntity(webhook));
    }

    /**
     * List all webhooks.
     */
    @GetMapping
    public ResponseEntity<List<WebhookDTO>> listWebhooks(
            @RequestParam(required = false) WebhookEntity.WebhookStatus status) {

        logger.debug("Listing webhooks with status filter: {}", status);

        List<WebhookEntity> webhooks;

        if (status != null) {
            if (status == WebhookEntity.WebhookStatus.ACTIVE) {
                webhooks = webhookDeliveryService.getActiveWebhooks();
            } else {
                webhooks = webhookDeliveryService.getAllWebhooks().stream()
                    .filter(w -> w.getStatus() == status)
                    .toList();
            }
        } else {
            webhooks = webhookDeliveryService.getAllWebhooks();
        }

        List<WebhookDTO> dtos = webhooks.stream()
            .map(WebhookDTO::fromEntity)
            .toList();

        return ResponseEntity.ok(dtos);
    }

    /**
     * Update a webhook.
     */
    @PutMapping("/{id}")
    public ResponseEntity<WebhookDTO> updateWebhook(
            @PathVariable Long id,
            @Valid @RequestBody CreateWebhookDTO request) {

        logger.info("Updating webhook: {}", id);

        webhookDeliveryService.updateWebhook(
            id,
            request.name(),
            request.url(),
            request.description(),
            request.subscribedEvents(),
            request.secretKey()
        );

        WebhookEntity webhook = webhookDeliveryService.getWebhook(id);

        return ResponseEntity.ok(WebhookDTO.fromEntity(webhook));
    }

    /**
     * Activate a webhook.
     */
    @PostMapping("/{id}/activate")
    public ResponseEntity<WebhookDTO> activateWebhook(@PathVariable Long id) {
        logger.info("Activating webhook: {}", id);

        webhookDeliveryService.activateWebhook(id);

        WebhookEntity webhook = webhookDeliveryService.getWebhook(id);

        return ResponseEntity.ok(WebhookDTO.fromEntity(webhook));
    }

    /**
     * Deactivate a webhook.
     */
    @PostMapping("/{id}/deactivate")
    public ResponseEntity<WebhookDTO> deactivateWebhook(@PathVariable Long id) {
        logger.info("Deactivating webhook: {}", id);

        webhookDeliveryService.deactivateWebhook(id);

        WebhookEntity webhook = webhookDeliveryService.getWebhook(id);

        return ResponseEntity.ok(WebhookDTO.fromEntity(webhook));
    }

    /**
     * Delete a webhook.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWebhook(@PathVariable Long id) {
        logger.info("Deleting webhook: {}", id);

        webhookDeliveryService.deleteWebhook(id);

        return ResponseEntity.noContent().build();
    }

    // ==================== Webhook Deliveries ====================

    /**
     * Get deliveries for a webhook.
     */
    @GetMapping("/{id}/deliveries")
    public ResponseEntity<List<WebhookDeliveryDTO>> getWebhookDeliveries(@PathVariable Long id) {
        logger.debug("Getting deliveries for webhook: {}", id);

        List<WebhookDeliveryEntity> deliveries = webhookDeliveryService.getWebhookDeliveries(id);

        List<WebhookDeliveryDTO> dtos = deliveries.stream()
            .map(WebhookDeliveryDTO::fromEntity)
            .toList();

        return ResponseEntity.ok(dtos);
    }

    /**
     * Get recent deliveries across all webhooks.
     */
    @GetMapping("/deliveries/recent")
    public ResponseEntity<List<WebhookDeliveryDTO>> getRecentDeliveries() {
        logger.debug("Getting recent deliveries");

        List<WebhookDeliveryEntity> deliveries = webhookDeliveryService.getRecentDeliveries();

        List<WebhookDeliveryDTO> dtos = deliveries.stream()
            .map(WebhookDeliveryDTO::fromEntity)
            .toList();

        return ResponseEntity.ok(dtos);
    }

    // ==================== Statistics ====================

    /**
     * Get webhook statistics.
     */
    @GetMapping("/stats")
    public ResponseEntity<WebhookDeliveryService.WebhookStatsDTO> getStatistics() {
        logger.debug("Getting webhook statistics");

        WebhookDeliveryService.WebhookStatsDTO stats = webhookDeliveryService.getStatistics();

        return ResponseEntity.ok(stats);
    }

    /**
     * Test a webhook by sending a test event.
     */
    @PostMapping("/{id}/test")
    public ResponseEntity<Void> testWebhook(@PathVariable Long id) {
        logger.info("Testing webhook: {}", id);

        WebhookEntity webhook = webhookDeliveryService.getWebhook(id);

        // Send test event
        webhookDeliveryService.deliverEvent(
            webhook,
            "TEST_EVENT",
            Map.of(
                "test", true,
                "message", "This is a test event from ConfigHub",
                "timestamp", System.currentTimeMillis()
            )
        );

        return ResponseEntity.accepted().build();
    }
}
