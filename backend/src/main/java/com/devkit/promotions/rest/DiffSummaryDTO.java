package com.devkit.promotions.rest;

/**
 * DTO for diff summary.
 */
public record DiffSummaryDTO(
    long total,
    long newConfigs,
    long modified,
    long deleted,
    long same
) {
    public static DiffSummaryDTO fromDomain(
        com.devkit.promotions.domain.EnvironmentPromotionService.DiffSummary summary) {
        return new DiffSummaryDTO(
            summary.total(),
            summary.newConfigs(),
            summary.modified(),
            summary.deleted(),
            summary.same()
        );
    }
}
