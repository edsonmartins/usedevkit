package com.devkit.sdk;

import com.devkit.sdk.http.HttpClient;

/**
 * Builder for creating DevKitClient instances.
 */
public class DevKitClientBuilder {

    private String apiKey;
    private String baseUrl = "http://localhost:8080";
    private int timeoutMs = 10_000;
    private long cacheExpireMs = 60_000; // 1 minute
    private boolean enableCache = true;

    public static DevKitClientBuilder create() {
        return new DevKitClientBuilder();
    }

    public DevKitClientBuilder apiKey(String apiKey) {
        this.apiKey = apiKey;
        return this;
    }

    public DevKitClientBuilder baseUrl(String baseUrl) {
        this.baseUrl = baseUrl;
        return this;
    }

    public DevKitClientBuilder timeout(int timeoutMs) {
        this.timeoutMs = timeoutMs;
        return this;
    }

    public DevKitClientBuilder cacheExpireAfter(long cacheExpireMs) {
        this.cacheExpireMs = cacheExpireMs;
        return this;
    }

    public DevKitClientBuilder enableCache(boolean enable) {
        this.enableCache = enable;
        return this;
    }

    public DevKitClient build() {
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalArgumentException("API key is required");
        }
        return new DevKitClient(this);
    }

    /**
     * Build a HotReloadConfigClient for automatic configuration updates.
     * @param environmentId Environment ID to watch
     * @param pollingIntervalMs Polling interval in milliseconds (default: 5000)
     * @return HotReloadConfigClient instance
     */
    public HotReloadConfigClient buildHotReload(String environmentId, long pollingIntervalMs) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalArgumentException("API key is required");
        }

        HttpClient httpClient = new HttpClient(baseUrl, apiKey, timeoutMs);
        return new HotReloadConfigClient(httpClient, environmentId, pollingIntervalMs, cacheExpireMs);
    }

    /**
     * Build a HotReloadConfigClient with default polling interval (5 seconds).
     */
    public HotReloadConfigClient buildHotReload(String environmentId) {
        return buildHotReload(environmentId, 5000);
    }

    // Getters for DevKitClient
    public String getApiKey() {
        return apiKey;
    }

    public String getBaseUrl() {
        return baseUrl;
    }

    public int getTimeoutMs() {
        return timeoutMs;
    }

    public long getCacheExpireMs() {
        return cacheExpireMs;
    }

    public boolean isCacheEnabled() {
        return enableCache;
    }
}
