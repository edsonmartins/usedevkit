package com.devkit.featureFlags.rest;

import com.devkit.featureFlags.domain.FeatureFlagQueryService;
import com.devkit.featureFlags.domain.FeatureFlagResult;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * REST Controller for Feature Flag Evaluation.
 * This controller is optimized for SDK consumption with lightweight responses.
 */
@RestController
@RequestMapping("/api/v1/feature-flags")
@Tag(name = "Feature Flag Evaluation", description = "SDK endpoints for evaluating feature flags")
public class FeatureFlagEvaluationController {

    private final FeatureFlagQueryService queryService;

    FeatureFlagEvaluationController(FeatureFlagQueryService queryService) {
        this.queryService = queryService;
    }

    @GetMapping("/evaluate/{key}")
    @Operation(summary = "Evaluate a feature flag", description = "Evaluate a feature flag for the current application")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Evaluation successful"),
        @ApiResponse(responseCode = "404", description = "Feature flag not found")
    })
    ResponseEntity<EvaluationResponse> evaluateFlag(
            @PathVariable String key,
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) Map<String, String> context,
            Authentication authentication) {

        String applicationId = authentication.getName();
        var flag = queryService.getFeatureFlagByKey(applicationId, key);

        boolean enabled = evaluateFlag(flag, userId, context);
        String variant = determineVariant(flag, userId, context);

        EvaluationResponse response = new EvaluationResponse(
                flag.key(),
                enabled,
                variant,
                flag.rolloutPercentage(),
                getVariantPayload(flag, variant)
        );

        return ResponseEntity.ok(response);
    }

    @PostMapping("/evaluate-batch")
    @Operation(summary = "Evaluate multiple feature flags", description = "Batch evaluation for multiple flags at once")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Batch evaluation successful")
    })
    ResponseEntity<Map<String, EvaluationResponse>> evaluateFlagsBatch(
            @RequestBody BatchEvaluationRequest request,
            Authentication authentication) {

        String applicationId = authentication.getName();
        Map<String, EvaluationResponse> evaluations = new HashMap<>();

        for (String key : request.keys()) {
            try {
                var flag = queryService.getFeatureFlagByKey(applicationId, key);
                boolean enabled = evaluateFlag(flag, request.userId(), request.context());
                String variant = determineVariant(flag, request.userId(), request.context());

                EvaluationResponse response = new EvaluationResponse(
                        flag.key(),
                        enabled,
                        variant,
                        flag.rolloutPercentage(),
                        getVariantPayload(flag, variant)
                );

                evaluations.put(key, response);
            } catch (Exception e) {
                // If flag doesn't exist or evaluation fails, return disabled
                evaluations.put(key, new EvaluationResponse(key, false, null, null, null));
            }
        }

        return ResponseEntity.ok(evaluations);
    }

    @GetMapping("/application/{applicationId}/all-flags")
    @Operation(summary = "Get all flags for SDK", description = "Get all feature flags for an application (SDK optimized)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Flags retrieved successfully")
    })
    ResponseEntity<AllFlagsResponse> getAllFlagsForSdk(
            @PathVariable String applicationId,
            Authentication authentication) {

        // Verify the application ID matches the authenticated application
        if (!applicationId.equals(authentication.getName())) {
            return ResponseEntity.status(403).build();
        }

        var flags = queryService.getFeatureFlagsByApplication(applicationId);

        Map<String, FlagConfig> flagConfigs = new HashMap<>();
        for (FeatureFlagResult flag : flags) {
            flagConfigs.put(flag.key(), new FlagConfig(
                    flag.key(),
                    flag.status(),
                    flag.rolloutStrategy(),
                    flag.rolloutPercentage(),
                    flag.targetingRules()
            ));
        }

        return ResponseEntity.ok(new AllFlagsResponse(flagConfigs));
    }

    /**
     * Evaluate if a feature flag should be enabled for a given user/context.
     */
    private boolean evaluateFlag(FeatureFlagResult flag, String userId, Map<String, String> context) {
        return switch (flag.status()) {
            case "ENABLED" -> true;
            case "DISABLED" -> false;
            case "CONDITIONAL" -> evaluateConditional(flag, userId, context);
            default -> false;
        };
    }

    /**
     * Evaluate conditional flag based on rollout strategy.
     */
    private boolean evaluateConditional(FeatureFlagResult flag, String userId, Map<String, String> context) {
        return switch (flag.rolloutStrategy()) {
            case "ALL" -> true;
            case "PERCENTAGE", "GRADUAL" -> {
                if (flag.rolloutPercentage() == null || flag.rolloutPercentage() >= 100) {
                    yield true;
                }
                // Simple hash-based percentage rollout
                int hash = userId != null ? userId.hashCode() : 0;
                int normalizedHash = Math.abs(hash) % 100;
                yield normalizedHash < flag.rolloutPercentage();
            }
            case "USER_SEGMENT" -> evaluateUserSegment(flag, userId, context);
            case "TARGETING_RULES" -> evaluateTargetingRules(flag, userId, context);
            default -> false;
        };
    }

    /**
     * Evaluate user segment targeting.
     */
    private boolean evaluateUserSegment(FeatureFlagResult flag, String userId, Map<String, String> context) {
        // TODO: Implement user segment evaluation
        // For now, return false
        return false;
    }

    /**
     * Evaluate targeting rules.
     */
    private boolean evaluateTargetingRules(FeatureFlagResult flag, String userId, Map<String, String> context) {
        // TODO: Implement targeting rules evaluation (JSON rules)
        // For now, return false
        return false;
    }

    /**
     * Determine which variant to show for A/B testing.
     */
    private String determineVariant(FeatureFlagResult flag, String userId, Map<String, String> context) {
        if (flag.variants() == null || flag.variants().isEmpty()) {
            return null;
        }

        // Find control variant
        var controlVariant = flag.variants().stream()
                .filter(v -> v.isControl())
                .findFirst()
                .orElse(null);

        if (controlVariant == null || flag.variants().size() == 1) {
            return controlVariant != null ? controlVariant.key() : null;
        }

        // Simple hash-based variant distribution
        int hash = userId != null ? userId.hashCode() : 0;
        int normalizedHash = Math.abs(hash) % 100;

        int cumulative = 0;
        for (var variant : flag.variants()) {
            cumulative += variant.rolloutPercentage();
            if (normalizedHash < cumulative) {
                return variant.key();
            }
        }

        return controlVariant.key();
    }

    /**
     * Extract payload from variant.
     */
    private String getVariantPayload(FeatureFlagResult flag, String variantKey) {
        if (variantKey == null || flag.variants() == null) {
            return null;
        }

        return flag.variants().stream()
                .filter(v -> v.key().equals(variantKey))
                .findFirst()
                .map(FeatureFlagResult.VariantResult::payload)
                .orElse(null);
    }
}

/**
 * Response object for flag evaluation.
 */
record EvaluationResponse(
    String key,
    boolean enabled,
    String variant,
    Integer rolloutPercentage,
    String payload
) {}

/**
 * Request object for batch evaluation.
 */
record BatchEvaluationRequest(
    java.util.List<String> keys,
    String userId,
    Map<String, String> context
) {}

/**
 * Response object for all flags.
 */
record AllFlagsResponse(
    Map<String, FlagConfig> flags
) {}

/**
 * Flag configuration for SDKs.
 */
record FlagConfig(
    String key,
    String status,
    String rolloutStrategy,
    Integer rolloutPercentage,
    String targetingRules
) {}
