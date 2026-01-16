package com.devkit.rbac.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;

/**
 * DTO for updating a tenant.
 */
public record UpdateTenantDTO(

    String name,

    String description,

    @Email(message = "Invalid email format")
    String billingEmail,

    String logoUrl,

    String website,

    String industry,

    Integer employeeCount,

    String billingAddress,

    String taxId

) {
}
