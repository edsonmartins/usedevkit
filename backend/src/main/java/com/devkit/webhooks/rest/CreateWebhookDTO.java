package com.devkit.webhooks.rest;

import com.devkit.webhooks.domain.WebhookEntity;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

/**
 * DTO for creating a webhook.
 */
public record CreateWebhookDTO(

    @NotBlank(message = "Name is required")
    @Size(max = 255, message = "Name must not exceed 255 characters")
    String name,

    @NotBlank(message = "URL is required")
    @Size(max = 500, message = "URL must not exceed 500 characters")
    String url,

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    String description,

    @Size(max = 255, message = "Application ID must not exceed 255 characters")
    String applicationId,

    @NotNull(message = "Subscribed events are required")
    List<WebhookEntity.WebhookEventType> subscribedEvents,

    @Size(max = 255, message = "Secret key must not exceed 255 characters")
    String secretKey

) {}
