package com.devkit.sdk.model;

/**
 * Result of a feature flag evaluation.
 */
public record FeatureFlagEvaluation(
    boolean enabled,
    String variantKey,
    String reason
) {
    public FeatureFlagEvaluation {
        // Invariant: variantKey can only be present when the flag is enabled
        if (variantKey != null && !enabled) {
            throw new IllegalArgumentException(
                "variantKey can only be present when enabled is true"
            );
        }
    }

    public static FeatureFlagEvaluation createEnabled() {
        return new FeatureFlagEvaluation(true, null, "FLAG_ENABLED");
    }

    public static FeatureFlagEvaluation createDisabled() {
        return new FeatureFlagEvaluation(false, null, "FLAG_DISABLED");
    }

    public static FeatureFlagEvaluation withVariant(String variantKey) {
        return new FeatureFlagEvaluation(true, variantKey, "MATCHING_VARIANT");
    }
}
