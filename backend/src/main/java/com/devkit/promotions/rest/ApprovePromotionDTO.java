package com.devkit.promotions.rest;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTO for approving a promotion request.
 */
public record ApprovePromotionDTO(

    @NotBlank(message = "Approved by is required")
    @Size(max = 255, message = "Approved by must not exceed 255 characters")
    String approvedBy,

    @Size(max = 1000, message = "Reason must not exceed 1000 characters")
    String reason

) {}
