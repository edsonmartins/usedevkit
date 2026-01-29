package com.devkit.secrets.application;

import com.devkit.audit.domain.AuditService;
import com.devkit.secrets.domain.events.SecretRotatedEvent;
import com.devkit.secrets.domain.events.SecretRotationFailedEvent;
import com.devkit.webhooks.domain.NotificationService;
import com.devkit.webhooks.domain.SecretRotationNotificationProperties;
import com.devkit.webhooks.domain.WebhookDeliveryService;
import com.devkit.webhooks.domain.WebhookEntity;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

import java.util.Map;

/**
 * Handles side-effects for secret rotation events (webhooks, notifications, audit logs).
 */
@Service
public class SecretRotationEventListener {

    private final WebhookDeliveryService webhookDeliveryService;
    private final NotificationService notificationService;
    private final SecretRotationNotificationProperties notificationProperties;
    private final AuditService auditService;

    public SecretRotationEventListener(
            WebhookDeliveryService webhookDeliveryService,
            NotificationService notificationService,
            SecretRotationNotificationProperties notificationProperties,
            AuditService auditService) {
        this.webhookDeliveryService = webhookDeliveryService;
        this.notificationService = notificationService;
        this.notificationProperties = notificationProperties;
        this.auditService = auditService;
    }

    @EventListener
    public void onSecretRotated(SecretRotatedEvent event) {
        webhookDeliveryService.triggerEvent(
            WebhookEntity.WebhookEventType.SECRET_ROTATED,
            event.applicationId(),
            Map.of(
                "secretId", event.secretId(),
                "key", event.key(),
                "rotatedBy", event.rotatedBy(),
                "version", event.newVersion(),
                "applicationId", event.applicationId(),
                "environmentId", event.environmentId()
            )
        );

        if (notificationProperties.isEnabled() && !notificationProperties.getRecipient().isBlank()) {
            notificationService.notifySecretRotation(
                notificationProperties.getChannel(),
                notificationProperties.getRecipient(),
                event.key(),
                event.applicationId(),
                event.environmentId()
            );
        }

        auditService.log(
            "SECRET",
            event.secretId(),
            "ROTATE",
            event.rotatedBy(),
            null,
            null,
            true,
            null
        );
    }

    @EventListener
    public void onSecretRotationFailed(SecretRotationFailedEvent event) {
        webhookDeliveryService.triggerEvent(
            WebhookEntity.WebhookEventType.SECRET_ROTATION_FAILED,
            event.applicationId(),
            Map.of(
                "secretId", event.secretId(),
                "key", event.key(),
                "rotatedBy", event.rotatedBy(),
                "version", event.version(),
                "applicationId", event.applicationId(),
                "environmentId", event.environmentId(),
                "error", event.errorMessage()
            )
        );

        if (notificationProperties.isEnabled() && !notificationProperties.getRecipient().isBlank()) {
            notificationService.notifySecretRotationFailed(
                notificationProperties.getChannel(),
                notificationProperties.getRecipient(),
                event.key(),
                event.applicationId(),
                event.environmentId(),
                event.errorMessage()
            );
        }

        auditService.log(
            "SECRET",
            event.secretId(),
            "ROTATE_FAILED",
            event.rotatedBy(),
            null,
            null,
            false,
            event.errorMessage()
        );
    }
}
