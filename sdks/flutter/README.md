# devkit_sdk

Dart client library for DevKit - Configuration Management & Feature Flags Platform.

## Installation

```yaml
dependencies:
  devkit_sdk: ^1.0.0
```

Then run:

```bash
flutter pub get
```

## Quick Start

```dart
import 'package:devkit_sdk/devkit_sdk.dart';

// Create client
final client = DevKitClient(
  apiKey: 'dk_prod_3x7...9k2'
);

// Feature Flags
final enabled = await client.isFeatureEnabled('new-checkout-flow', 'user-123');
if (enabled) {
  // Show new checkout
} else {
  // Show old checkout
}

// Configurations
final apiKey = await client.getConfig('prod', 'stripe.api.key');
final timeout = await client.getConfigWithType<int>('prod', 'request.timeout', 'int');

// Secrets
final dbPassword = await client.getSecret('my-app', 'prod', 'database.password');
```

## Features

- ✅ Feature Flags with targeting rules
- ✅ Dynamic Configuration with caching
- ✅ Secrets Management (encrypted at rest)
- ✅ Type-safe configuration retrieval
- ✅ Automatic cache invalidation
- ✅ Null-safety
- ✅ Async/await support
- ✅ Error handling and fallbacks

## API Documentation

### Feature Flags

```dart
// Simple boolean check
final enabled = await client.isFeatureEnabled(flagKey, userId);

// With attributes
final enabled = await client.isFeatureEnabledWithAttributes(
  flagKey,
  userId,
  {'plan': 'premium', 'country': 'BR'},
);

// Get evaluation with variant
final evaluation = await client.evaluateFeatureFlag(flagKey, userId);
if (evaluation.variantKey != null) {
  // User is in variant
}
```

### Configurations

```dart
// Get string value
final value = await client.getConfig(environmentId, key);

// Get with type conversion
final port = await client.getConfigWithType<int>(environmentId, 'server.port', 'int');
final rate = await client.getConfigWithType<double>(environmentId, 'api.rate', 'double');
final debug = await client.getConfigWithType<bool>(environmentId, 'debug.mode', 'bool');

// Get all configs as map
final configs = await client.getConfigMap(environmentId);
```

### Secrets

```dart
// Get decrypted secret
final password = await client.getSecret(applicationId, environmentId, key);

// Get all secrets as map
final secrets = await client.getSecretMap(applicationId, environmentId);
```

### Cache Management

```dart
// Invalidate specific key
client.invalidateCache('config:prod:api.key');

// Clear all cache
client.clearCache();

// Get cache size
final size = client.cacheSize;
```

## Configuration Options

```dart
final client = DevKitClient(
  apiKey: 'your-api-key',                    // Required
  baseUrl: 'https://api.usedevkit.com',     // Optional, default: http://localhost:8080
  timeout: Duration(milliseconds: 15000),  // Optional, default: 10000ms
  cacheExpireAfter: Duration(minutes: 2),   // Optional, default: 1 minute
  enableCache: true,                         // Optional, default: true
);
```

## Error Handling

```dart
import 'package:devkit_sdk/devkit_sdk.dart';

try {
  final enabled = await client.isFeatureEnabled('flag-key', 'user-id');
} on AuthenticationError catch (e) {
  print('Authentication failed: ${e.message}');
} on DevKitError catch (e) {
  print('DevKit error: ${e.message}');
}
```

## Flutter Integration

### Provider Example

```dart
import 'package:flutter/material.dart';
import 'package:devkit_sdk/devkit_sdk.dart';

class DevKitProvider extends InheritedWidget {
  final DevKitClient client;

  const DevKitProvider({
    super.key,
    required this.client,
    required super.child,
  });

  static DevKitClient of(BuildContext context) {
    final provider = context.dependOnInheritedWidgetOfExactType<DevKitProvider>();
    return provider.client;
  }

  @override
  bool updateShouldNotify(DevKitProvider oldWidget) => client != oldWidget.client;
}

// Usage
class MyWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final client = DevKitProvider.of(context);

    return FutureBuilder<bool>(
      future: client.isFeatureEnabled('new-ui', 'user-123'),
      builder: (context, snapshot) {
        if (snapshot.hasData && snapshot.data!) {
          return NewUI();
        }
        return OldUI();
      },
    );
  }
}
```

### Riverpod Example

```dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:devkit_sdk/devkit_sdk.dart';

final devKitClientProvider = Provider<DevKitClient>((ref) {
  return DevKitClient(apiKey: 'your-api-key');
});

final featureFlagProvider = FutureProvider.family<bool, String>((ref, flagKey) async {
  final client = ref.watch(devKitClientProvider);
  return client.isFeatureEnabled(flagKey, 'user-123');
});

// Usage
class MyWidget extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isEnabled = ref.watch(featureFlagProvider('new-ui'));

    return isEnabled.when(
      data: (enabled) => enabled ? NewUI() : OldUI(),
      loading: () => CircularProgressIndicator(),
      error: (_, __) => Text('Error loading feature flag'),
    );
  }
}
```

## Requirements

- Dart 3.0+
- Flutter 3.0+ (optional)

## License

MIT License - see LICENSE file for details.
