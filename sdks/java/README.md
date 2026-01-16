# DevKit Java SDK

Java client library for DevKit - Configuration Management & Feature Flags Platform.

## Installation

### Maven

```xml
<dependency>
    <groupId>com.devkit</groupId>
    <artifactId>devkit-sdk-java</artifactId>
    <version>1.0.0</version>
</dependency>
```

### Gradle

```gradle
implementation 'com.devkit:devkit-sdk-java:1.0.0'
```

## Quick Start

```java
import com.devkit.sdk.DevKitClient;
import com.devkit.sdk.DevKitClientBuilder;

// Create client
DevKitClient client = DevKitClientBuilder.create()
    .apiKey("dk_prod_3x7...9k2")
    .build();

// Feature Flags
boolean enabled = client.isFeatureEnabled("new-checkout-flow", "user-123");
if (enabled) {
    // Show new checkout
} else {
    // Show old checkout
}

// Configurations
String apiKey = client.getConfig("prod", "stripe.api.key");
int timeout = client.getConfig("prod", "request.timeout", Integer.class);

// Secrets
String dbPassword = client.getSecret("my-app", "prod", "database.password");
```

## Features

- ✅ Feature Flags with targeting rules
- ✅ Dynamic Configuration with caching
- ✅ Secrets Management (encrypted at rest)
- ✅ Type-safe configuration retrieval
- ✅ Automatic cache invalidation
- ✅ Builder pattern for configuration
- ✅ Error handling and fallbacks

## API Documentation

### Feature Flags

```java
// Simple boolean check
boolean enabled = client.isFeatureEnabled(flagKey, userId);

// With attributes
Map<String, Object> attributes = Map.of(
    "plan", "premium",
    "country", "BR"
);
boolean enabled = client.isFeatureEnabled(flagKey, userId, attributes);

// Get evaluation with variant
FeatureFlagEvaluation evaluation = client.evaluateFeatureFlag(flagKey, userId);
if (evaluation.variantKey() != null) {
    // User is in variant
}
```

### Configurations

```java
// Get string value
String value = client.getConfig(environmentId, key);

// Get with type conversion
Integer port = client.getConfig(environmentId, "server.port", Integer.class);
Double rate = client.getConfig(environmentId, "api.rate", Double.class);
Boolean debug = client.getConfig(environmentId, "debug.mode", Boolean.class);

// Get all configs as map
Map<String, String> configs = client.getConfigMap(environmentId);
```

### Secrets

```java
// Get decrypted secret
String password = client.getSecret(applicationId, environmentId, key);

// Get all secrets as map
Map<String, String> secrets = client.getSecretMap(applicationId, environmentId);
```

### Cache Management

```java
// Invalidate specific key
client.invalidateCache("config:prod:api.key");

// Clear all cache
client.clearCache();

// Get cache size
long size = client.getCacheSize();
```

## Builder Options

```java
DevKitClient client = DevKitClientBuilder.create()
    .apiKey("your-api-key")              // Required
    .baseUrl("https://api.usedevkit.com") // Optional, default: http://localhost:8080
    .timeout(15000)                       // Optional, default: 10000ms
    .cacheExpireAfter(120000)             // Optional, default: 60000ms (1 min)
    .enableCache(true)                     // Optional, default: true
    .build();
```

## Error Handling

```java
try {
    boolean enabled = client.isFeatureEnabled("flag-key", "user-id");
} catch (AuthenticationException e) {
    // Invalid API key
    System.err.println("Authentication failed: " + e.getMessage());
} catch (DevKitException e) {
    // API error
    System.err.println("DevKit error: " + e.getMessage());
}
```

## Requirements

- Java 17+
- Maven 3.6+ or Gradle 7+

## License

MIT License - see LICENSE file for details.
