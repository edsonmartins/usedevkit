package com.devkit.promotions.rest;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTO for rejecting a promotion request.
 */
public record RejectPromotionDTO(

    @NotBlank(message = "Rejected by is required")
    @Size(max = 255, message = "Rejected by must not exceed 255 characters")
    String rejectedBy,

    @NotBlank(message = "Rejection reason is required")
    @Size(max = 1000, message = "Reason must not exceed 1000 characters")
    String reason

) {}
