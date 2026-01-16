# DevKit SDKs - Complete Guide

## Overview

DevKit provides official SDKs for the most popular programming languages and frameworks. All SDKs support:

- ✅ **Feature Flags** - Remote feature toggles with A/B testing
- ✅ **Dynamic Configuration** - Real-time config updates without restart
- ✅ **Secrets Management** - Secure credential storage and retrieval
- ✅ **Intelligent Caching** - Built-in caching with TTL
- ✅ **Type Safety** - Full TypeScript/Dart type definitions

## Available SDKs

| SDK | Language | Status | Package |
|-----|----------|--------|---------|
| Java SDK | Java 17+ | ✅ Production | `com.devkit:sdk` |
| TypeScript SDK | TypeScript/Node.js | ✅ Production | `@devkit/sdk` |
| Flutter SDK | Dart 3.0+ | ✅ Production | `devkit_sdk` |

---

## TypeScript SDK

### Installation

```bash
# NPM
npm install @devkit/sdk

# Yarn
yarn add @devkit/sdk

# pnpm
pnpm add @devkit/sdk
```

### Quick Start

```typescript
import { DevKitClient } from '@devkit/sdk';

// Initialize client
const client = new DevKitClient({
  apiKey: 'your-api-key',
  baseUrl: 'http://localhost:8080',
  enableCache: true,
  cacheExpireAfter: 60000, // 1 minute
});

// Feature flags
const enabled = await client.isFeatureEnabled('my-flag', 'user-123');

// Dynamic configuration
const timeout = await client.getConfig<number>('production', 'api.timeout', 'number');

// Secrets
const password = await client.getSecret('my-app', 'production', 'db.password');
```

### Full Example

```typescript
import { DevKitClient } from '@devkit/sdk';

async function main() {
  const client = new DevKitClient({
    apiKey: process.env.DEVKIT_API_KEY!,
  });

  // Check feature flag
  const newUI = await client.isFeatureEnabled('new-ui', 'user-123');
  if (newUI) {
    console.log('User sees new UI');
  }

  // Get configuration
  const apiTimeout = await client.getConfig<number>('production', 'api.timeout', 'number');
  console.log(`API timeout: ${apiTimeout}ms`);

  // Get secret
  const dbPassword = await client.getSecret('my-app', 'production', 'db.password');
  console.log(`DB password: ${dbPassword}`);

  // Get all configs
  const configs = await client.getConfigMap('production');
  console.log('All configs:', configs);
}

main().catch(console.error);
```

### Browser Usage

```typescript
import { DevKitClient } from '@devkit/sdk';

const client = new DevKitClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.usedevkit.com',
});

// Check feature flag for user
document.addEventListener('DOMContentLoaded', async () => {
  const darkMode = await client.isFeatureEnabled('dark-mode', 'user-id');

  if (darkMode) {
    document.body.classList.add('dark-mode');
  }
});
```

### API Reference

#### Constructor Options

```typescript
interface DevKitOptions {
  apiKey: string;              // Required: Your API key
  baseUrl?: string;            // Default: 'http://localhost:8080'
  timeout?: number;            // Default: 10000 (10 seconds)
  enableCache?: boolean;       // Default: true
  cacheExpireAfter?: number;   // Default: 60000 (1 minute)
}
```

#### Feature Flags

```typescript
// Simple check
async isFeatureEnabled(flagKey: string, userId: string): Promise<boolean>

// With attributes
async isFeatureEnabledWithAttributes(
  flagKey: string,
  userId: string,
  attributes: Record<string, unknown>
): Promise<boolean>

// Detailed evaluation
async evaluateFeatureFlag(
  flagKey: string,
  userId: string,
  attributes?: Record<string, unknown>
): Promise<FeatureFlagEvaluation>

interface FeatureFlagEvaluation {
  enabled: boolean;
  variantKey?: string;
  reason: string;
}
```

#### Configuration

```typescript
// Get string value
async getConfig(environmentId: string, key: string): Promise<string>

// Get typed value
async getConfig<T extends string | number | boolean>(
  environmentId: string,
  key: string,
  type: 'string' | 'number' | 'boolean'
): Promise<T>

// Get all configs
async getConfigMap(environmentId: string): Promise<Record<string, string>>
```

#### Secrets

```typescript
// Get single secret
async getSecret(
  applicationId: string,
  environmentId: string,
  key: string
): Promise<string>

// Get all secrets
async getSecretMap(
  applicationId: string,
  environmentId: string
): Promise<Record<string, string>>
```

#### Cache Management

```typescript
// Invalidate specific key
invalidateCache(key: string): void

// Clear all cache
clearCache(): void

// Get cache size
getCacheSize(): number
```

---

## Flutter SDK

### Installation

```yaml
dependencies:
  devkit_sdk:
    git:
      url: https://github.com/usedevkit/flutter-sdk.git
      ref: main
```

Or install from local:

```yaml
dependencies:
  devkit_sdk:
    path: ../sdks/flutter
```

### Quick Start

```dart
import 'package:devkit_sdk/devkit_sdk.dart';

// Initialize client
final client = DevKitClient(
  apiKey: 'your-api-key',
  baseUrl: 'http://localhost:8080',
  enableCache: true,
  cacheExpireAfter: Duration(minutes: 1),
);

// Feature flags
final enabled = await client.isFeatureEnabled('my-flag', 'user-123');

// Dynamic configuration
final timeout = await client.getConfig<int>('production', 'api.timeout', type: 'number');

// Secrets
final password = await client.getSecret('my-app', 'production', 'db.password');
```

### Full Example

```dart
import 'package:devkit_sdk/devkit_sdk.dart';

Future<void> main() async {
  final client = DevKitClient(
    apiKey: 'your-api-key',
  );

  // Check feature flag
  final newUI = await client.isFeatureEnabled('new-ui', 'user-123');
  if (newUI) {
    print('User sees new UI');
  }

  // Get configuration
  final apiTimeout = await client.getConfig<int>(
    'production',
    'api.timeout',
    type: 'number',
  );
  print('API timeout: ${apiTimeout}ms');

  // Get secret
  final dbPassword = await client.getSecret(
    'my-app',
    'production',
    'db.password',
  );
  print('DB password: $dbPassword');

  // Get all configs
  final configs = await client.getConfigMap('production');
  print('All configs: $configs');
}
```

### Widget Integration

```dart
class FeatureGatedWidget extends StatelessWidget {
  final String userId;
  final String featureKey;
  final Widget child;

  const FeatureGatedWidget({
    required this.userId,
    required this.featureKey,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<bool>(
      future: DevKitClient.instance.isFeatureEnabled(featureKey, userId),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return CircularProgressIndicator();
        }

        if (snapshot.data == true) {
          return child;
        }

        return SizedBox.shrink();
      },
    );
  }
}
```

### API Reference

#### Constructor Options

```dart
DevKitClient({
  required String apiKey,
  String baseUrl = 'http://localhost:8080',
  Duration timeout = const Duration(seconds: 10),
  bool enableCache = true,
  Duration? cacheExpireAfter,
})
```

#### Feature Flags

```dart
// Simple check
Future<bool> isFeatureEnabled(String flagKey, String userId)

// With attributes
Future<bool> isFeatureEnabledWithAttributes(
  String flagKey,
  String userId, {
  Map<String, dynamic>? attributes,
})

// Detailed evaluation
Future<FeatureFlagEvaluation> evaluateFeatureFlag(
  String flagKey,
  String userId, {
  Map<String, dynamic>? attributes,
})

class FeatureFlagEvaluation {
  final bool enabled;
  final String? variantKey;
  final String reason;
}
```

#### Configuration

```dart
// Get string value
Future<String> getConfig(String environmentId, String key)

// Get typed value
Future<T> getConfig<T>(
  String environmentId,
  String key, {
  required String type, // 'string', 'number', 'boolean'
})

// Get all configs
Future<Map<String, String>> getConfigMap(String environmentId)
```

#### Secrets

```dart
// Get single secret
Future<String> getSecret(
  String applicationId,
  String environmentId,
  String key,
)

// Get all secrets
Future<Map<String, String>> getSecretMap(
  String applicationId,
  String environmentId,
)
```

#### Cache Management

```dart
// Invalidate specific key
void invalidateCache(String key)

// Clear all cache
void clearCache()

// Get cache size
int get cacheSize
```

---

## Java SDK

### Installation (Maven)

```xml
<dependency>
    <groupId>com.devkit</groupId>
    <artifactId>sdk</artifactId>
    <version>1.0.0</version>
</dependency>
```

### Installation (Gradle)

```gradle
implementation 'com.devkit:sdk:1.0.0'
```

### Quick Start

```java
import com.devkit.sdk.*;

// Initialize client
DevKitClient client = new DevKitClientBuilder()
    .apiKey("your-api-key")
    .baseUrl("http://localhost:8080")
    .cacheEnabled(true)
    .cacheExpireAfter(60000) // 1 minute
    .build();

// Feature flags
boolean enabled = client.isFeatureEnabled("my-flag", "user-123");

// Configuration
String timeout = client.getConfig("env-prod", "api.timeout");

// Secrets
String password = client.getSecret("my-app", "env-prod", "db.password");
```

### Hot Reload Example

```java
import com.devkit.sdk.*;
import java.util.concurrent.atomic.AtomicInteger;

// Initialize hot reload client
HotReloadConfigClient hotReload = new DevKitClientBuilder()
    .apiKey("your-api-key")
    .buildHotReload("production", 5000); // Poll every 5 seconds

AtomicInteger rateLimit = new AtomicInteger(1000);

// Start hot reload
hotReload.start(configs -> {
    String newRateLimit = configs.get("rate.limit.api");
    if (newRateLimit != null) {
        int limit = Integer.parseInt(newRateLimit);
        rateLimit.set(limit);
        System.out.println("Rate limit updated to: " + limit);
    }
});

// Use in application
if (requests.get() > rateLimit.get()) {
    return Response.status(429).build();
}
```

---

## Publishing Guide

### Publishing TypeScript SDK to NPM

#### 1. Build the SDK

```bash
cd sdks/typescript
npm install
npm run build
```

#### 2. Test Locally

```bash
# Create test package
npm pack

# Install in test project
npm install devkit-sdk-1.0.0.tgz
```

#### 3. Publish to NPM

```bash
# Login to NPM
npm login

# Publish
npm publish --access public
```

#### 4. Verify Installation

```bash
# In a new project
npm install @devkit/sdk
```

### Publishing Flutter SDK to Pub.dev

#### 1. Prepare Package

```bash
cd sdks/flutter

# Ensure pubspec.yaml is correct
# Update version
# Add description, homepage, repository
```

#### 2. Run Tests

```bash
flutter pub get
flutter test
flutter analyze
```

#### 3. Publish to Pub.dev

```bash
# Login to Pub.dev
flutter pub login

# Dry run (validates package)
flutter pub publish --dry-run

# Publish
flutter pub publish
```

#### 4. Verify Installation

```yaml
# In pubspec.yaml
dependencies:
  devkit_sdk:
    hosted: https://pub.dev
    version: ^1.0.0
```

---

## Best Practices

### 1. API Key Security

**❌ Don't:**
```typescript
// Hardcoded in source code
const client = new DevKitClient({
  apiKey: 'sk_live_abc123...'
});
```

**✅ Do:**
```typescript
// Environment variable
const client = new DevKitClient({
  apiKey: process.env.DEVKIT_API_KEY!
});
```

### 2. Error Handling

**❌ Don't:**
```typescript
const config = await client.getConfig('prod', 'key');
```

**✅ Do:**
```typescript
try {
  const config = await client.getConfig('prod', 'key');
} catch (error) {
  if (error instanceof NotFoundError) {
    // Use default value
    config = 'default-value';
  } else {
    // Handle other errors
    console.error('Failed to fetch config:', error);
  }
}
```

### 3. Cache Strategy

**For frequently changing configs:**
```typescript
const client = new DevKitClient({
  cacheExpireAfter: 5000, // 5 seconds
});
```

**For rarely changing configs:**
```typescript
const client = new DevKitClient({
  cacheExpireAfter: 300000, // 5 minutes
});
```

### 4. Feature Flag Attributes

**✅ Provide rich attributes:**
```typescript
const enabled = await client.isFeatureEnabledWithAttributes(
  'premium-features',
  'user-123',
  {
    plan: 'premium',
    region: 'us-east-1',
    accountAge: 365,
    signupDate: '2024-01-01',
  }
);
```

### 5. Graceful Degradation

```typescript
// Feature flag with fallback
async function isFeatureEnabled(flagKey: string, userId: string): Promise<boolean> {
  try {
    return await client.isFeatureEnabled(flagKey, userId);
  } catch (error) {
    console.error('Failed to check feature flag:', error);
    return false; // Default to disabled
  }
}
```

---

## Troubleshooting

### Common Issues

#### 1. "API key is required"

**Error:** `Error: API key is required`

**Solution:** Make sure you're passing the API key:
```typescript
const client = new DevKitClient({
  apiKey: process.env.DEVKIT_API_KEY!, // Use non-null assertion
});
```

#### 2. "Request timeout"

**Error:** `TimeoutError: Request timeout`

**Solution:** Increase timeout:
```typescript
const client = new DevKitClient({
  timeout: 30000, // 30 seconds
});
```

#### 3. Cache not expiring

**Issue:** Changes not reflecting in cached values

**Solution:**
```typescript
// Clear cache manually
client.clearCache();

// Or reduce cache TTL
const client = new DevKitClient({
  cacheExpireAfter: 5000, // 5 seconds
});
```

#### 4. Flutter/Dart type errors

**Error:** `Type 'String' is not a subtype of type 'int'`

**Solution:** Always specify type parameter:
```dart
final timeout = await client.getConfig<int>(
  'production',
  'api.timeout',
  type: 'number',
);
```

---

## Support

- **Documentation**: `/docs`
- **Examples**: `/examples`
- **Issues**: GitHub Issues
- **Discord**: Community Discord server

## Status

✅ **All SDKs Production Ready**

- Java SDK: Complete with hot reload
- TypeScript SDK: Node.js + Browser support
- Flutter SDK: Mobile + Desktop support
