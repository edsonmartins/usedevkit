package com.devkit.webhooks.domain;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;

/**
 * Service for sending notifications via email and Slack.
 */
@Service
public class NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);

    /**
     * Send an email notification.
     */
    public void sendEmail(
            String to,
            String subject,
            String message,
            Map<String, Object> metadata) {

        // TODO: Integrate with email service (SendGrid, AWS SES, etc.)
        // For now, just log
        logger.info("Sending email to: {} | Subject: {} | Message: {}",
            to, subject, message);

        // Example integration:
        // EmailRequest email = EmailRequest.builder()
        //     .to(to)
        //     .subject(subject)
        //     .body(message)
        //     .build();
        // emailService.send(email);
    }

    /**
     * Send a Slack notification.
     */
    public void sendSlackMessage(
            String webhookUrl,
            String message,
            Map<String, Object> metadata) {

        // TODO: Integrate with Slack webhook
        // For now, just log
        logger.info("Sending Slack message | Webhook: {} | Message: {}",
            webhookUrl, message);

        // Example integration:
        // SlackMessage slackMessage = SlackMessage.builder()
        //     .text(message)
        //     .attachments(buildAttachments(metadata))
        //     .build();
        // slackRestTemplate.postForObject(webhookUrl, slackMessage, String.class);
    }

    /**
     * Send notification based on preferences.
     */
    public void sendNotification(
            String channel,
            String recipient,
            String subject,
            String message,
            Map<String, Object> metadata) {

        switch (channel.toLowerCase()) {
            case "email":
                sendEmail(recipient, subject, message, metadata);
                break;

            case "slack":
                sendSlackMessage(recipient, message, metadata);
                break;

            default:
                logger.warn("Unknown notification channel: {}", channel);
        }
    }

    /**
     * Notify about configuration change.
     */
    public void notifyConfigChange(
            String channel,
            String recipient,
            String applicationId,
            String environmentId,
            String configKey,
            String action) {

        String subject = String.format("Configuration %s: %s", action, configKey);
        String message = String.format(
            "Configuration %s detected in application %s, environment %s\n" +
            "Key: %s\n" +
            "Time: %s",
            action.toLowerCase(),
            applicationId,
            environmentId,
            configKey,
            Instant.now()
        );

        sendNotification(channel, recipient, subject, message, Map.of(
            "applicationId", applicationId,
            "environmentId", environmentId,
            "configKey", configKey,
            "action", action
        ));
    }

    /**
     * Notify about secret rotation.
     */
    public void notifySecretRotation(
            String channel,
            String recipient,
            String secretKey,
            String applicationId,
            String environmentId) {

        String subject = String.format("Secret Rotated: %s", secretKey);
        String message = String.format(
            "Secret has been rotated\n" +
            "Key: %s\n" +
            "Application: %s\n" +
            "Environment: %s\n" +
            "Time: %s",
            secretKey,
            applicationId,
            environmentId,
            Instant.now()
        );

        sendNotification(channel, recipient, subject, message, Map.of(
            "secretKey", secretKey,
            "applicationId", applicationId,
            "environmentId", environmentId
        ));
    }

    /**
     * Notify about secret rotation failure.
     */
    public void notifySecretRotationFailed(
            String channel,
            String recipient,
            String secretKey,
            String applicationId,
            String environmentId,
            String errorMessage) {

        String subject = String.format("Secret Rotation Failed: %s", secretKey);
        String message = String.format(
            "Secret rotation failed\n" +
            "Key: %s\n" +
            "Application: %s\n" +
            "Environment: %s\n" +
            "Error: %s\n" +
            "Time: %s",
            secretKey,
            applicationId,
            environmentId,
            errorMessage,
            Instant.now()
        );

        sendNotification(channel, recipient, subject, message, Map.of(
            "secretKey", secretKey,
            "applicationId", applicationId,
            "environmentId", environmentId,
            "error", errorMessage
        ));
    }

    /**
     * Notify about promotion status.
     */
    public void notifyPromotionStatus(
            String channel,
            String recipient,
            String promotionId,
            String status,
            String sourceEnvironment,
            String targetEnvironment) {

        String subject = String.format("Promotion %s: %s", status, promotionId);
        String message = String.format(
            "Environment promotion %s\n" +
            "Promotion ID: %s\n" +
            "Source: %s\n" +
            "Target: %s\n" +
            "Time: %s",
            status.toLowerCase(),
            promotionId,
            sourceEnvironment,
            targetEnvironment,
            Instant.now()
        );

        sendNotification(channel, recipient, subject, message, Map.of(
            "promotionId", promotionId,
            "status", status,
            "sourceEnvironment", sourceEnvironment,
            "targetEnvironment", targetEnvironment
        ));
    }
}
