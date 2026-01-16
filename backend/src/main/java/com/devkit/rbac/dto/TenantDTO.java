package com.devkit.rbac.dto;

import java.time.Instant;
import java.util.Map;

/**
 * DTO for tenant responses.
 */
public record TenantDTO(

    Long id,

    String name,

    String slug,

    String description,

    String ownerEmail,

    String plan,

    Boolean isActive,

    String logoUrl,

    String website,

    String industry,

    Integer employeeCount,

    String billingAddress,

    String taxId,

    // Plan limits
    Integer maxUsers,
    Integer maxApplications,
    Integer maxConfigsPerApplication,
    Boolean unlimitedApps,

    // Current usage
    Integer userCount,
    Integer applicationCount,
    Integer configCount,

    // Trial info
    Instant trialEndsAt,
    Integer daysUntilTrialEnds,

    // Timestamps
    Instant createdAt,
    Instant updatedAt,
    Instant subscriptionRenewedAt

) {
}
