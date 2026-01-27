package com.devkit.bootstrap.dto;

/**
 * Response DTO for bootstrap status check.
 */
public record BootstrapStatusResponse(
    boolean needsSetup,
    String message
) {
    public static BootstrapStatusResponse requiresSetup() {
        return new BootstrapStatusResponse(true, "System needs initial setup");
    }

    public static BootstrapStatusResponse setupComplete() {
        return new BootstrapStatusResponse(false, "System is already configured");
    }
}
