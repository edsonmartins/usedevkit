package com.devkit.sdk;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.TimeUnit;

/**
 * Cache for configurations and feature flags using Caffeine.
 */
public class ConfigCache {

    private final Cache<String, Object> cache;

    public ConfigCache(long expireAfterWriteMs) {
        this.cache = Caffeine.newBuilder()
                .expireAfterWrite(expireAfterWriteMs, TimeUnit.MILLISECONDS)
                .maximumSize(10_000)
                .build();
    }

    public void put(String key, Object value) {
        cache.put(key, value);
    }

    public <T> T get(String key, Class<T> type) {
        Object value = cache.getIfPresent(key);
        if (value != null && type.isInstance(value)) {
            return type.cast(value);
        }
        return null;
    }

    public <T> T get(String key) {
        Object value = cache.getIfPresent(key);
        @SuppressWarnings("unchecked")
        T result = (T) value;
        return result;
    }

    public void invalidate(String key) {
        cache.invalidate(key);
    }

    public void invalidateAll() {
        cache.invalidateAll();
    }

    public Map<String, Object> asMap() {
        return cache.asMap();
    }

    public long size() {
        return cache.estimatedSize();
    }
}
