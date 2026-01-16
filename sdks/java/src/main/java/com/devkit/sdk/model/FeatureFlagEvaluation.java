package com.devkit.sdk.model;

/**
 * Result of a feature flag evaluation.
 */
public record FeatureFlagEvaluation(
    boolean enabled,
    String variantKey,
    String reason
) {
    public static FeatureFlagEvaluation enabled() {
        return new FeatureFlagEvaluation(true, null, "FLAG_ENABLED");
    }

    public static FeatureFlagEvaluation disabled() {
        return new FeatureFlagEvaluation(false, null, "FLAG_DISABLED");
    }

    public static FeatureFlagEvaluation withVariant(String variantKey) {
        return new FeatureFlagEvaluation(true, variantKey, "MATCHING_VARIANT");
    }
}
