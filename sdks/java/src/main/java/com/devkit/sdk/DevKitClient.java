package com.devkit.sdk;

import com.devkit.sdk.crypto.CryptoUtil;
import com.devkit.sdk.crypto.DecryptionException;
import com.devkit.sdk.http.HttpClient;
import com.devkit.sdk.model.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Main client for interacting with DevKit API.
 * Supports Configurations, Secrets, and Feature Flags.
 * <p>
 * Client-side decryption is performed using the application's encryption key,
 * which can be configured via:
 * <ul>
 *   <li>Environment variable: DEVKIT_ENCRYPTION_KEY</li>
 *   <li>Builder method: {@link DevKitClientBuilder#encryptionKey(String)}</li>
 * </ul>
 * <p>
 * <b>Error Handling:</b> This client propagates all exceptions to the calling code.
 * Network errors, decryption failures, and invalid responses are not silently handled.
 * Decryption failures throw {@link DecryptionException} with detailed error messages.
 * Use appropriate try-catch blocks or error handling mechanisms in your application.
 */
public class DevKitClient {

    private final HttpClient httpClient;
    private final ConfigCache cache;
    private final boolean cacheEnabled;
    private final CryptoUtil cryptoUtil;

    DevKitClient(DevKitClientBuilder builder) {
        this.httpClient = new HttpClient(
                builder.getBaseUrl(),
                builder.getApiKey(),
                builder.getTimeoutMs()
        );
        this.cacheEnabled = builder.isCacheEnabled();
        this.cache = new ConfigCache(builder.getCacheExpireMs());

        // Initialize CryptoUtil with encryption key from builder or environment variable
        String encryptionKey = builder.getEncryptionKey();
        if (encryptionKey == null || encryptionKey.isBlank()) {
            encryptionKey = System.getenv("DEVKIT_ENCRYPTION_KEY");
        }

        if (encryptionKey != null && !encryptionKey.isBlank()) {
            this.cryptoUtil = new CryptoUtil(encryptionKey);
        } else {
            this.cryptoUtil = null;
        }
    }

    // ==================== Feature Flags ====================

    public boolean isFeatureEnabled(String flagKey, String userId) {
        return isFeatureEnabled(flagKey, userId, null);
    }

    public boolean isFeatureEnabled(String flagKey, String userId, Map<String, Object> attributes) {
        String cacheKey = String.format("flag:%s:%s", flagKey, userId);

        if (cacheEnabled) {
            Boolean cached = cache.get(cacheKey, Boolean.class);
            if (cached != null) {
                return cached;
            }
        }

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
    }

    public FeatureFlagEvaluation evaluateFeatureFlag(String flagKey, String userId) {
        return evaluateFeatureFlag(flagKey, userId, null);
    }

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

        String value = decryptIfNeeded(config.value());

        if (cacheEnabled) {
            cache.put(cacheKey, value);
        }
        return value;
    }

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

        Map<String, String> decryptedMap = decryptMapIfNeeded(configMap);

        if (cacheEnabled) {
            cache.put(cacheKey, decryptedMap);
        }
        return decryptedMap;
    }

    // ==================== Secrets ====================

    public String getSecret(String applicationId, String environmentId, String key) {
        ensureCryptoEnabled("Secrets require an encryption key to be configured");

        String cacheKey = String.format("secret:%s:%s:%s", applicationId, environmentId, key);

        if (cacheEnabled) {
            String cached = cache.get(cacheKey, String.class);
            if (cached != null) {
                return cached;
            }
        }

        Map<String, String> secretMap = httpClient.get(
                String.format("/api/v1/secrets/application/%s/environment/%s/map", applicationId, environmentId),
                Map.class
        );

        String encryptedValue = secretMap.get(key);
        if (encryptedValue == null) {
            throw new IllegalArgumentException("Secret not found: " + key);
        }

        String decryptedValue = cryptoUtil.decrypt(encryptedValue);

        if (cacheEnabled) {
            cache.put(cacheKey, decryptedValue);
        }
        return decryptedValue;
    }

    public Map<String, String> getSecretMap(String applicationId, String environmentId) {
        ensureCryptoEnabled("Secrets require an encryption key to be configured");

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

        Map<String, String> decryptedMap = new java.util.HashMap<>();
        List<String> failedKeys = new ArrayList<>();
        for (Map.Entry<String, String> entry : secretMap.entrySet()) {
            try {
                decryptedMap.put(entry.getKey(), cryptoUtil.decrypt(entry.getValue()));
            } catch (Exception e) {
                failedKeys.add(entry.getKey());
            }
        }

        if (!failedKeys.isEmpty()) {
            throw new IllegalStateException(
                "Failed to decrypt " + failedKeys.size() + " secret(s): " + failedKeys +
                ". Verify your DEVKIT_ENCRYPTION_KEY is correct.");
        }

        if (cacheEnabled) {
            cache.put(cacheKey, decryptedMap);
        }
        return decryptedMap;
    }

    // ==================== Cache Management ====================

    public void invalidateCache(String key) {
        if (cacheEnabled) {
            cache.invalidate(key);
        }
    }

    public void clearCache() {
        if (cacheEnabled) {
            cache.invalidateAll();
        }
    }

    public long getCacheSize() {
        if (!cacheEnabled) {
            return 0;
        }
        return cache.size();
    }

    // ==================== Encryption Utilities ====================

    public boolean isCryptoEnabled() {
        return cryptoUtil != null;
    }

    public String getEncryptionKeyHash() {
        if (cryptoUtil == null) {
            return null;
        }
        return cryptoUtil.getKeyHash();
    }

    // ==================== Private Methods ====================

    private String decryptIfNeeded(String value) {
        if (value == null || value.isEmpty()) {
            return value;
        }

        if (cryptoUtil == null) {
            return value;
        }

        if (!CryptoUtil.isEncrypted(value)) {
            return value;
        }

        return cryptoUtil.decrypt(value);
    }

    private Map<String, String> decryptMapIfNeeded(Map<String, String> map) {
        if (map == null || map.isEmpty()) {
            return map;
        }

        if (cryptoUtil == null) {
            return map;
        }

        Map<String, String> result = new java.util.HashMap<>();
        for (Map.Entry<String, String> entry : map.entrySet()) {
            result.put(entry.getKey(), decryptIfNeeded(entry.getValue()));
        }
        return result;
    }

    private void ensureCryptoEnabled(String message) {
        if (cryptoUtil == null) {
            throw new IllegalStateException(
                    message + ". Please set DEVKIT_ENCRYPTION_KEY environment variable " +
                            "or call encryptionKey() on the builder."
            );
        }
    }

    // ==================== Inner Classes ====================

    private record EvaluateRequest(
            String flagKey,
            String userId,
            Map<String, Object> attributes
    ) {
    }
}
