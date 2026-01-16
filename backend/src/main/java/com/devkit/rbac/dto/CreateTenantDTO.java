package com.devkit.rbac.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

/**
 * DTO for creating a new tenant.
 */
public record CreateTenantDTO(

    @NotBlank(message = "Name is required")
    String name,

    @NotBlank(message = "Slug is required")
    @Pattern(regexp = "^[a-z0-9-]+$", message = "Slug must contain only lowercase letters, numbers, and hyphens")
    String slug,

    String description,

    @NotBlank(message = "Owner email is required")
    @Email(message = "Invalid email format")
    String ownerEmail,

    @NotNull(message = "Plan is required")
    TenantPlanDTO plan,

    String logoUrl,

    String website,

    String industry,

    Integer employeeCount

) {
    public enum TenantPlanDTO {
        FREE,
        STARTER,
        PROFESSIONAL,
        ENTERPRISE
    }
}
