package com.devkit.sdk;

import com.devkit.sdk.http.HttpClient;
import com.devkit.sdk.model.*;

import java.util.List;
import java.util.Map;

/**
 * Main client for interacting with DevKit API.
 * Supports Configurations, Secrets, and Feature Flags.
 */
public class DevKitClient {

    private final HttpClient httpClient;
    private final ConfigCache cache;
    private final boolean cacheEnabled;

    DevKitClient(DevKitClientBuilder builder) {
        this.httpClient = new HttpClient(
                builder.getBaseUrl(),
                builder.getApiKey(),
                builder.getTimeoutMs()
        );
        this.cacheEnabled = builder.isCacheEnabled();
        this.cache = new ConfigCache(builder.getCacheExpireMs());
    }

    // ==================== Feature Flags ====================

    /**
     * Check if a feature flag is enabled for a user.
     */
    public boolean isFeatureEnabled(String flagKey, String userId) {
        return isFeatureEnabled(flagKey, userId, null);
    }

    /**
     * Check if a feature flag is enabled with optional attributes.
     */
    public boolean isFeatureEnabled(String flagKey, String userId, Map<String, Object> attributes) {
        String cacheKey = String.format("flag:%s:%s", flagKey, userId);

        if (cacheEnabled) {
            Boolean cached = cache.get(cacheKey, Boolean.class);
            if (cached != null) {
                return cached;
            }
        }

        try {
            FeatureFlagEvaluation evaluation = httpClient.post(
                    "/api/v1/feature-flags/evaluate",
                    new EvaluateRequest(flagKey, userId, attributes),
                    FeatureFlagEvaluation.class
            );

            boolean result = evaluation.enabled();
            if (cacheEnabled) {
                cache.put(cacheKey, result);
            }
            return result;
        } catch (Exception e) {
            // Fallback to false on error
            return false;
        }
    }

    /**
     * Get feature flag with variant information.
     */
    public FeatureFlagEvaluation evaluateFeatureFlag(String flagKey, String userId) {
        return evaluateFeatureFlag(flagKey, userId, null);
    }

    /**
     * Get feature flag with variant and attributes.
     */
    public FeatureFlagEvaluation evaluateFeatureFlag(String flagKey, String userId, Map<String, Object> attributes) {
        String cacheKey = String.format("flag_eval:%s:%s", flagKey, userId);

        if (cacheEnabled) {
            FeatureFlagEvaluation cached = cache.get(cacheKey, FeatureFlagEvaluation.class);
            if (cached != null) {
                return cached;
            }
        }

        FeatureFlagEvaluation evaluation = httpClient.post(
                "/api/v1/feature-flags/evaluate",
                new EvaluateRequest(flagKey, userId, attributes),
                FeatureFlagEvaluation.class
        );

        if (cacheEnabled) {
            cache.put(cacheKey, evaluation);
        }
        return evaluation;
    }

    // ==================== Configurations ====================

    /**
     * Get configuration value by key.
     */
    public String getConfig(String environmentId, String key) {
        String cacheKey = String.format("config:%s:%s", environmentId, key);

        if (cacheEnabled) {
            String cached = cache.get(cacheKey, String.class);
            if (cached != null) {
                return cached;
            }
        }

        Configuration config = httpClient.get(
                String.format("/api/v1/configurations/environment/%s/key/%s", environmentId, key),
                Configuration.class
        );

        if (cacheEnabled) {
            cache.put(cacheKey, config.value());
        }
        return config.value();
    }

    /**
     * Get configuration with type conversion.
     */
    public <T> T getConfig(String environmentId, String key, Class<T> type) {
        String value = getConfig(environmentId, key);

        if (type == String.class) {
            return type.cast(value);
        } else if (type == Integer.class || type == int.class) {
            return type.cast(Integer.parseInt(value));
        } else if (type == Long.class || type == long.class) {
            return type.cast(Long.parseLong(value));
        } else if (type == Boolean.class || type == boolean.class) {
            return type.cast(Boolean.parseBoolean(value));
        } else if (type == Double.class || type == double.class) {
            return type.cast(Double.parseDouble(value));
        } else {
            throw new IllegalArgumentException("Unsupported type: " + type);
        }
    }

    /**
     * Get all configurations as map.
     */
    public Map<String, String> getConfigMap(String environmentId) {
        String cacheKey = String.format("config_map:%s", environmentId);

        if (cacheEnabled) {
            Map<String, String> cached = cache.get(cacheKey, Map.class);
            if (cached != null) {
                return cached;
            }
        }

        Map<String, String> configMap = httpClient.get(
                String.format("/api/v1/configurations/environment/%s/map", environmentId),
                Map.class
        );

        if (cacheEnabled) {
            cache.put(cacheKey, configMap);
        }
        return configMap;
    }

    // ==================== Secrets ====================

    /**
     * Get secret value (decrypted).
     */
    public String getSecret(String applicationId, String environmentId, String key) {
        String cacheKey = String.format("secret:%s:%s:%s", applicationId, environmentId, key);

        if (cacheEnabled) {
            String cached = cache.get(cacheKey, String.class);
            if (cached != null) {
                return cached;
            }
        }

        Secret secret = httpClient.get(
                String.format("/api/v1/secrets/%s/decrypt", key), // This endpoint may need adjustment
                Secret.class
        );

        if (cacheEnabled) {
            cache.put(cacheKey, secret.decryptedValue());
        }
        return secret.decryptedValue();
    }

    /**
     * Get all secrets as map (decrypted values).
     */
    public Map<String, String> getSecretMap(String applicationId, String environmentId) {
        String cacheKey = String.format("secret_map:%s:%s", applicationId, environmentId);

        if (cacheEnabled) {
            Map<String, String> cached = cache.get(cacheKey, Map.class);
            if (cached != null) {
                return cached;
            }
        }

        Map<String, String> secretMap = httpClient.get(
                String.format("/api/v1/secrets/application/%s/environment/%s/map", applicationId, environmentId),
                Map.class
        );

        if (cacheEnabled) {
            cache.put(cacheKey, secretMap);
        }
        return secretMap;
    }

    // ==================== Cache Management ====================

    /**
     * Invalidate specific cache entry.
     */
    public void invalidateCache(String key) {
        if (cacheEnabled) {
            cache.invalidate(key);
        }
    }

    /**
     * Clear all cached values.
     */
    public void clearCache() {
        if (cacheEnabled) {
            cache.invalidateAll();
        }
    }

    /**
     * Get cache statistics.
     */
    public long getCacheSize() {
        if (!cacheEnabled) {
            return 0;
        }
        return cache.size();
    }

    // ==================== Inner Classes ====================

    private record EvaluateRequest(
            String flagKey,
            String userId,
            Map<String, Object> attributes
    ) {
    }
}
