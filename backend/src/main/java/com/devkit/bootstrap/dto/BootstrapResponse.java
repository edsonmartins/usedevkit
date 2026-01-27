package com.devkit.bootstrap.dto;

/**
 * Response DTO for bootstrap operation.
 * Contains the generated API key that should be shown ONCE to the user.
 */
public record BootstrapResponse(
    String tenantId,
    String tenantName,
    String applicationId,
    String applicationName,
    String apiKey,
    String message
) {
    public static BootstrapResponse success(
            String tenantId,
            String tenantName,
            String applicationId,
            String applicationName,
            String apiKey) {
        return new BootstrapResponse(
            tenantId,
            tenantName,
            applicationId,
            applicationName,
            apiKey,
            "Bootstrap completed successfully. Save your API key - it will only be shown once!"
        );
    }
}
