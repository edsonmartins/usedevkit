# Dynamic Configuration - Complete Guide

## Overview

Dynamic Configuration allows you to change application settings in real-time without restarting your services. Perfect for rate limits, feature toggles, A/B testing parameters, and any runtime configuration.

**Key Feature**: Change rate limit in production WITHOUT restart! 🚀

## Features

### Core Capabilities

- ✅ **Long Polling API**: Efficient real-time updates (config推送)
- ✅ **Hot Reload SDK**: Automatic configuration refresh in Java applications
- ✅ **Version History**: Full audit trail with rollback capability
- ✅ **Validation**: Type-safe configuration updates
- ✅ **SSE Streaming**: Server-Sent Events for instant updates

## Architecture

### Backend Components

```
src/main/java/com/devkit/configurations/
├── domain/
│   ├── ConfigurationEntity.java              # Main entity with version tracking
│   ├── ConfigurationVersionEntity.java       # Version history
│   ├── ConfigurationRepository.java          # Spring Data JPA
│   ├── ConfigurationCommandService.java      # Write operations
│   ├── ConfigurationQueryService.java        # Read operations
│   └── events/
│       ├── ConfigurationCreatedEvent.java
│       ├── ConfigurationUpdatedEvent.java
│       └── ConfigurationDeletedEvent.java
└── rest/
    ├── ConfigurationController.java          # CRUD endpoints
    ├── ConfigurationPollingController.java  # Long polling & SSE ⭐ NEW
    └── ConfigurationVersionController.java   # Version history & rollback ⭐ NEW
```

### SDK Components

```
sdks/java/src/main/java/com/devkit/sdk/
├── DevKitClient.java                         # Standard client
├── DevKitClientBuilder.java                  # Builder with hot reload support
├── HotReloadConfigClient.java                # Auto-refresh client ⭐ NEW
└── ConfigCache.java                          # Caffeine cache wrapper
```

## REST API

### 1. Long Polling API

#### Poll for Updates

```http
GET /api/v1/configurations/environment/{environmentId}/poll?lastUpdate={timestamp}&timeout=30
```

**Parameters:**
- `environmentId`: Environment to watch
- `lastUpdate` (optional): Last update timestamp in milliseconds since epoch
- `timeout` (default: 30, max: 60): Maximum wait time in seconds

**Response:**
```json
{
  "hasUpdates": true,
  "configurations": {
    "rate.limit.api": "1000",
    "feature.new_ui": "enabled",
    "cache.ttl.seconds": "300"
  },
  "lastUpdate": 1704067200000
}
```

**Behavior:**
- If there are changes since `lastUpdate`: returns immediately with new configs
- If no changes: waits up to `timeout` seconds for updates
- If timeout: returns `hasUpdates: false` with empty configs

#### SSE Stream (Alternative)

```http
GET /api/v1/configurations/environment/{environmentId}/stream
```

**Content-Type:** `text/event-stream`

**Response:**
```
event: configuration-update
data: {"configurations":{"rate.limit.api":"1000"},"timestamp":1704067200000}

event: configuration-update
data: {"configurations":{"rate.limit.api":"2000"},"timestamp":1704067260000}
```

### 2. Version History API

#### Get All Versions

```http
GET /api/v1/configurations/{configurationId}/versions
```

**Response:**
```json
[
  {
    "id": "version-3",
    "key": "rate.limit.api",
    "value": "2000",
    "type": "INTEGER",
    "description": "API rate limit per minute",
    "versionNumber": 3,
    "createdAt": "2024-01-15T10:30:00Z"
  },
  {
    "id": "version-2",
    "key": "rate.limit.api",
    "value": "1500",
    "type": "INTEGER",
    "description": "API rate limit per minute",
    "versionNumber": 2,
    "createdAt": "2024-01-14T15:20:00Z"
  }
]
```

#### Get Specific Version

```http
GET /api/v1/configurations/{configurationId}/versions/{versionNumber}
```

#### Rollback to Version

```http
POST /api/v1/configurations/{configurationId}/versions/{versionNumber}/rollback
```

Creates a new version with the rolled-back values, preserving full history.

## Java SDK Usage

### Standard Client (Manual Refresh)

```java
import com.devkit.sdk.*;

// Build client
DevKitClient client = new DevKitClientBuilder()
    .baseUrl("https://api.usedevkit.com")
    .apiKey("your-api-key")
    .cacheEnabled(true)
    .cacheExpireAfter(60000) // 1 minute
    .build();

// Get configuration
String rateLimit = client.getConfig("env-prod", "rate.limit.api");
int limit = Integer.parseInt(rateLimit);

// Update configuration from UI
// ... wait up to 1 minute ...

// Clear cache to force refresh
client.clearCache();

// Get updated value
rateLimit = client.getConfig("env-prod", "rate.limit.api");
```

### Hot Reload Client (Auto-Refresh) ⭐

```java
import com.devkit.sdk.*;

// Build hot reload client
HotReloadConfigClient hotReload = new DevKitClientBuilder()
    .baseUrl("https://api.usedevkit.com")
    .apiKey("your-api-key")
    .buildHotReload("env-prod", 5000); // Poll every 5 seconds

// Start hot reload with callback
hotReload.start(configs -> {
    // This callback runs automatically when configs change
    String newRateLimit = configs.get("rate.limit.api");
    System.out.println("Rate limit updated to: " + newRateLimit);

    // Update your application state
    updateRateLimiter(newRateLimit);
});

// Get current config (always fresh from cache)
String currentConfig = hotReload.getConfig("rate.limit.api");
Map<String, String> allConfigs = hotReload.getAllConfigs();

// When shutting down
hotReload.stop();
```

### Complete Example: Rate Limiter with Hot Reload

```java
import com.devkit.sdk.*;
import java.util.concurrent.atomic.AtomicInteger;

public class RateLimiterService {

    private final HotReloadConfigClient configClient;
    private final AtomicInteger rateLimit;

    public RateLimiterService() {
        // Build hot reload client
        this.configClient = new DevKitClientBuilder()
            .baseUrl("https://api.usedevkit.com")
            .apiKey("your-api-key")
            .buildHotReload("production", 5000);

        // Initialize with current value
        Map<String, String> initial = configClient.getAllConfigs();
        this.rateLimit = new AtomicInteger(
            Integer.parseInt(initial.getOrDefault("rate.limit.api", "1000"))
        );

        // Start hot reload
        configClient.start(configs -> {
            // Auto-update rate limit when changed
            String newValue = configs.get("rate.limit.api");
            if (newValue != null) {
                int newLimit = Integer.parseInt(newValue);
                rateLimit.set(newLimit);
                System.out.println("Rate limit updated: " + newLimit);
            }
        });
    }

    public boolean checkLimit() {
        // Your rate limiting logic
        return true;
    }

    public void shutdown() {
        configClient.stop();
    }
}

// Usage in main application
public class Application {
    public static void main(String[] args) {
        RateLimiterService rateLimiter = new RateLimiterService();

        // Your application runs here
        // Config updates automatically - no restart needed!

        // Graceful shutdown
        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            rateLimiter.shutdown();
        }));
    }
}
```

### Advanced: Multiple Environments

```java
// Production config with hot reload
HotReloadConfigClient prodConfig = new DevKitClientBuilder()
    .apiKey("prod-key")
    .buildHotReload("production");

// Staging config with standard client
DevKitClient stagingConfig = new DevKitClientBuilder()
    .apiKey("staging-key")
    .build();

// Use different clients for different environments
```

## Real-World Use Cases

### Use Case 1: Dynamic Rate Limiting

**Problem:** API is being abused, need to reduce rate limit immediately without restart.

**Solution:**

1. **Initial Config:**
```json
{
  "key": "rate.limit.api",
  "value": "10000",
  "type": "INTEGER",
  "environmentId": "production"
}
```

2. **Application Code:**
```java
// Start with hot reload
HotReloadConfigClient config = new DevKitClientBuilder()
    .buildHotReload("production", 3000); // Check every 3 seconds

AtomicInteger rateLimit = new AtomicInteger(10000);

config.start(configs -> {
    int newLimit = Integer.parseInt(configs.get("rate.limit.api"));
    rateLimit.set(newLimit);
    logger.info("Rate limit updated to: {}", newLimit);
});

// In your API filter
if (requests.get() > rateLimit.get()) {
    return Response.status(429).entity("Rate limit exceeded").build();
}
```

3. **Update from UI:**
   - Go to Configurations → Select "production"
   - Find `rate.limit.api`
   - Edit value from `10000` to `5000`
   - Save

4. **Result:**
   - SDK detects change within 3 seconds
   - Rate limit automatically updated
   - No restart needed!

### Use Case 2: Feature Toggle Parameters

**Problem:** A/B testing with different thresholds, need to adjust conversion threshold.

**Solution:**

```java
HotReloadConfigClient config = new DevKitClientBuilder()
    .buildHotReload("production");

AtomicInteger conversionThreshold = new AtomicInteger(50);

config.start(configs -> {
    conversionThreshold.set(Integer.parseInt(
        configs.getOrDefault("abtest.conversion.threshold", "50")
    ));
});

// In your conversion logic
if (conversionScore > conversionThreshold.get()) {
    showPremiumVersion();
} else {
    showFreeVersion();
}
```

### Use Case 3: Cache TTL Adjustment

**Problem:** Database is under heavy load, need to increase cache TTL immediately.

**Solution:**

```java
HotReloadConfigClient config = new DevKitClientBuilder()
    .buildHotReload("production");

AtomicLong cacheTtl = new AtomicLong(300); // 5 minutes default

config.start(configs -> {
    cacheTtl.set(Long.parseLong(
        configs.getOrDefault("cache.ttl.seconds", "300")
    ));
});

// Your cache uses the updated TTL
cache.put(key, value, cacheTtl.get());
```

## Best Practices

### 1. Polling Interval

- **Frequently changing configs**: 3-5 seconds
- **Normal configs**: 10-30 seconds
- **Rarely changing**: 60+ seconds

```java
// High-frequency configs (rate limits, feature flags)
.buildHotReload("production", 3000)

// Normal configs
.buildHotReload("production", 15000)

// Low-frequency configs
.buildHotReload("production", 60000)
```

### 2. Error Handling

```java
hotReload.start(configs -> {
    try {
        // Update configurations
        updateApplicationState(configs);
    } catch (Exception e) {
        logger.error("Failed to update config", e);
        // Keep running with old config
    }
});
```

### 3. Graceful Shutdown

```java
Runtime.getRuntime().addShutdownHook(new Thread(() -> {
    logger.info("Shutting down config client...");
    hotReload.stop();
}));
```

### 4. Validation

```java
hotReload.start(configs -> {
    String rateLimit = configs.get("rate.limit.api");

    // Validate before applying
    try {
        int limit = Integer.parseInt(rateLimit);
        if (limit < 0 || limit > 100000) {
            logger.warn("Invalid rate limit: {}", rateLimit);
            return; // Skip this update
        }
        rateLimiter.setLimit(limit);
    } catch (NumberFormatException e) {
        logger.error("Invalid rate limit format: {}", rateLimit);
    }
});
```

### 5. Type Safety

```java
public class ConfigValidator {
    public static Integer getInt(Map<String, String> configs, String key, Integer defaultValue) {
        String value = configs.get(key);
        if (value == null) return defaultValue;

        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException e) {
            logger.error("Invalid integer value for {}: {}", key, value);
            return defaultValue;
        }
    }

    public static Boolean getBoolean(Map<String, String> configs, String key, Boolean defaultValue) {
        String value = configs.get(key);
        if (value == null) return defaultValue;

        return Boolean.parseBoolean(value);
    }
}

// Usage
hotReload.start(configs -> {
    int rateLimit = ConfigValidator.getInt(configs, "rate.limit.api", 1000);
    boolean debugMode = ConfigValidator.getBoolean(configs, "debug.mode", false);

    updateConfig(rateLimit, debugMode);
});
```

## Web Interface

### Live Editor (Coming Soon)

The web interface will provide:
- **Real-time editor** with syntax highlighting
- **Validation** before saving
- **Diff view** comparing versions
- **Rollback** to any previous version
- **Audit log** of who changed what and when

### Version History View

1. Go to **Configurations** page
2. Click on a configuration
3. View **History** tab
4. See all versions with:
   - Version number
   - Previous value
   - Changed by
   - Timestamp
   - Rollback button

## Performance Considerations

### Client-Side

- **Caching**: All configs cached locally (Caffeine cache)
- **Batch Updates**: Multiple configs updated in single callback
- **Thread-Safe**: Safe concurrent access to cached values
- **Low Overhead**: Polling is lightweight, only checks timestamps

### Server-Side

- **Efficient Polling**: Uses Thread.sleep() instead of busy waiting
- **Connection Pooling**: Reuses HTTP connections
- **Database Optimized**: Only queries DB when actual changes exist
- **Scalability**: Supports 1000s of concurrent polling connections

### Monitoring

```java
hotReload.start(configs -> {
    long startTime = System.currentTimeMillis();

    updateApplicationState(configs);

    long duration = System.currentTimeMillis() - startTime;
    metrics.recordConfigUpdateTime(duration);

    if (duration > 1000) {
        logger.warn("Slow config update: {}ms", duration);
    }
});
```

## Troubleshooting

### Configs Not Updating

1. **Check polling is running:**
```java
assert hotReload.isRunning() : "Hot reload not started!";
```

2. **Check callback is being called:**
```java
AtomicInteger updateCount = new AtomicInteger(0);
hotReload.start(configs -> {
    updateCount.incrementAndGet();
    logger.info("Config updated, count: {}", updateCount.get());
});
```

3. **Check timestamp tracking:**
```java
logger.info("Last update: {}", hotReload.getLastUpdate());
```

### High Memory Usage

If you have many configurations:

```java
// Disable cache for hot reload (always fresh from server)
HotReloadConfigClient config = new DevKitClientBuilder()
    .enableCache(false)  // ⚠️ Will fetch from server every poll
    .buildHotReload("production");
```

### Connection Issues

```java
hotReload.start(configs -> {
    try {
        updateApplicationState(configs);
    } catch (Exception e) {
        // Log but continue - will retry next poll
        logger.error("Config update failed, will retry", e);
    }
});
```

## Status

✅ **Sprint 3-4: Dynamic Configuration** - COMPLETE

- ✅ Long polling API
- ✅ Hot reload Java SDK
- ✅ Version history API
- ✅ Rollback functionality
- ⏳ Live editor UI (pending)
- ⏳ Validation layer (pending)

## Next Steps

1. **Live Editor UI**: Real-time configuration editor in web interface
2. **Validation Schema**: JSON schema validation for configuration values
3. **Change Requests**: Approval workflow for production changes
4. **Encryption**: Encrypt sensitive configs at rest
5. **Multi-Region**: Replicate configs across regions

## Support

- **Documentation**: `/docs`
- **Examples**: `/examples/dynamic-config`
- **Issues**: GitHub Issues
