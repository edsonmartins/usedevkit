package com.devkit.promotions.rest;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

/**
 * DTO for creating a promotion request.
 */
public record CreatePromotionRequestDTO(

    @NotBlank(message = "Application ID is required")
    String applicationId,

    @NotBlank(message = "Source environment is required")
    @Size(max = 100, message = "Source environment must not exceed 100 characters")
    String sourceEnvironment,

    @NotBlank(message = "Target environment is required")
    @Size(max = 100, message = "Target environment must not exceed 100 characters")
    String targetEnvironment,

    @NotBlank(message = "Requested by is required")
    @Size(max = 255, message = "Requested by must not exceed 255 characters")
    String requestedBy,

    @NotNull(message = "Include all configs flag is required")
    Boolean includeAllConfigs,

    List<String> configKeys,

    @NotNull(message = "Smoke test enabled flag is required")
    Boolean smokeTestEnabled

) {}
