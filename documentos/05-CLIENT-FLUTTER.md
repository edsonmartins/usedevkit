# ConfigHub - SDK Flutter

## 📦 Estrutura do Projeto

```
sdk-flutter/
├── lib/
│   ├── src/
│   │   ├── client.dart
│   │   ├── cache.dart
│   │   ├── models/
│   │   │   ├── configuration.dart
│   │   │   ├── options.dart
│   │   │   └── exceptions.dart
│   │   └── utils/
│   │       └── http_client.dart
│   └── confighub_sdk.dart
├── test/
│   ├── client_test.dart
│   └── cache_test.dart
├── example/
│   └── main.dart
├── pubspec.yaml
└── README.md
```

---

## 📦 pubspec.yaml

```yaml
name: confighub_sdk
description: Flutter/Dart client library for ConfigHub configuration management
version: 1.0.0
homepage: https://github.com/confighub/confighub

environment:
  sdk: '>=3.0.0 <4.0.0'
  flutter: '>=3.0.0'

dependencies:
  flutter:
    sdk: flutter
  
  # HTTP client
  http: ^1.1.2
  
  # JSON serialization
  json_annotation: ^4.8.1
  
  # Logging
  logging: ^1.2.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  
  # Testing
  mockito: ^5.4.4
  build_runner: ^2.4.7
  json_serializable: ^6.7.1
  
  # Linting
  flutter_lints: ^3.0.1

flutter:
  uses-material-design: true
```

---

## 🎯 Models

### models/options.dart

```dart
/// Configuration options for ConfigHub client
class ConfigHubOptions {
  /// Base URL of ConfigHub server
  final String baseUrl;

  /// API key for authentication
  final String apiKey;

  /// Request timeout in seconds
  final int timeout;

  /// Enable caching
  final bool cacheEnabled;

  /// Cache TTL in seconds
  final int cacheTtl;

  /// Maximum number of retries
  final int maxRetries;

  /// Custom headers
  final Map<String, String>? headers;

  const ConfigHubOptions({
    required this.baseUrl,
    required this.apiKey,
    this.timeout = 30,
    this.cacheEnabled = true,
    this.cacheTtl = 300, // 5 minutes
    this.maxRetries = 3,
    this.headers,
  });

  /// Create options from environment variables
  factory ConfigHubOptions.fromEnv({
    String baseUrlKey = 'CONFIGHUB_URL',
    String apiKeyKey = 'CONFIGHUB_API_KEY',
  }) {
    final baseUrl = const String.fromEnvironment(baseUrlKey);
    final apiKey = const String.fromEnvironment(apiKeyKey);

    if (baseUrl.isEmpty) {
      throw ArgumentError('Environment variable $baseUrlKey is required');
    }
    if (apiKey.isEmpty) {
      throw ArgumentError('Environment variable $apiKeyKey is required');
    }

    return ConfigHubOptions(
      baseUrl: baseUrl,
      apiKey: apiKey,
    );
  }
}
```

### models/configuration.dart

```dart
import 'package:json_annotation/json_annotation.dart';

part 'configuration.g.dart';

@JsonSerializable()
class Configuration {
  final String id;
  final String key;
  final dynamic value;
  final bool sensitive;
  final String type;
  final String? description;
  final int version;
  final DateTime createdAt;
  final DateTime updatedAt;
  final String? updatedBy;

  Configuration({
    required this.id,
    required this.key,
    this.value,
    required this.sensitive,
    required this.type,
    this.description,
    required this.version,
    required this.createdAt,
    required this.updatedAt,
    this.updatedBy,
  });

  factory Configuration.fromJson(Map<String, dynamic> json) =>
      _$ConfigurationFromJson(json);

  Map<String, dynamic> toJson() => _$ConfigurationToJson(this);
}
```

### models/exceptions.dart

```dart
/// Base exception for ConfigHub errors
class ConfigHubException implements Exception {
  final String message;
  final dynamic cause;

  ConfigHubException(this.message, [this.cause]);

  @override
  String toString() => 'ConfigHubException: $message${cause != null ? ' ($cause)' : ''}';
}

/// Authentication/Authorization error
class AuthenticationException extends ConfigHubException {
  AuthenticationException(String message) : super(message);

  @override
  String toString() => 'AuthenticationException: $message';
}

/// Resource not found error
class NotFoundException extends ConfigHubException {
  NotFoundException(String message) : super(message);

  @override
  String toString() => 'NotFoundException: $message';
}

/// Network error
class NetworkException extends ConfigHubException {
  NetworkException(String message, [dynamic cause]) : super(message, cause);

  @override
  String toString() => 'NetworkException: $message';
}
```

---

## 🔧 Client (client.dart)

```dart
import 'dart:async';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:logging/logging.dart';

import 'cache.dart';
import 'models/configuration.dart';
import 'models/exceptions.dart';
import 'models/options.dart';

/// ConfigHub client for managing configurations
class ConfigHubClient {
  final ConfigHubOptions options;
  final http.Client _httpClient;
  final ConfigCache? _cache;
  final Logger _logger = Logger('ConfigHubClient');

  late final String _baseUrl;
  late final Map<String, String> _headers;

  ConfigHubClient(this.options) : _httpClient = http.Client() {
    _baseUrl = options.baseUrl.endsWith('/')
        ? '${options.baseUrl}api/v1'
        : '${options.baseUrl}/api/v1';

    _headers = {
      'Content-Type': 'application/json',
      'X-API-Key': options.apiKey,
      'User-Agent': 'ConfigHub-Flutter-SDK/1.0.0',
      ...?options.headers,
    };

    _cache = options.cacheEnabled
        ? ConfigCache(Duration(seconds: options.cacheTtl))
        : null;

    _logger.info('ConfigHub client initialized for ${options.baseUrl}');
  }

  /// Get all configurations for an application and environment
  Future<Map<String, dynamic>> getConfigurations(
    String appName,
    String environment, {
    bool includeValues = true,
  }) async {
    final cacheKey = '$appName:$environment:$includeValues';

    // Check cache
    if (_cache != null) {
      final cached = _cache!.get(cacheKey);
      if (cached != null) {
        _logger.fine('Cache hit for $cacheKey');
        return cached;
      }
    }

    final url = Uri.parse(
      '$_baseUrl/configurations/app/$appName/env/$environment?includeValues=$includeValues',
    );

    try {
      final response = await _httpClient
          .get(url, headers: _headers)
          .timeout(Duration(seconds: options.timeout));

      if (response.statusCode != 200) {
        throw _handleError(response);
      }

      final configs = json.decode(response.body) as Map<String, dynamic>;

      // Cache the result
      if (_cache != null) {
        _cache!.set(cacheKey, configs);
      }

      _logger.info('Retrieved ${configs.length} configurations for $appName:$environment');
      return configs;
    } on TimeoutException {
      throw NetworkException('Request timeout after ${options.timeout}s');
    } catch (e) {
      if (e is ConfigHubException) rethrow;
      throw NetworkException('Failed to fetch configurations', e);
    }
  }

  /// Get a single configuration value
  Future<T?> getConfig<T>(
    String appName,
    String environment,
    String key,
  ) async {
    final configs = await getConfigurations(appName, environment);
    return configs[key] as T?;
  }

  /// Get configuration with default value
  Future<T> getConfigWithDefault<T>(
    String appName,
    String environment,
    String key,
    T defaultValue,
  ) async {
    try {
      final value = await getConfig<T>(appName, environment, key);
      return value ?? defaultValue;
    } catch (e) {
      _logger.warning('Failed to get config $key, using default: $e');
      return defaultValue;
    }
  }

  /// Get integer configuration
  Future<int?> getIntConfig(
    String appName,
    String environment,
    String key, {
    int? defaultValue,
  }) async {
    final value = await getConfig(appName, environment, key);
    if (value == null) return defaultValue;

    if (value is int) return value;
    if (value is String) {
      final parsed = int.tryParse(value);
      if (parsed == null) {
        _logger.warning('Config $key is not a valid integer');
        return defaultValue;
      }
      return parsed;
    }

    return defaultValue;
  }

  /// Get boolean configuration
  Future<bool?> getBooleanConfig(
    String appName,
    String environment,
    String key, {
    bool? defaultValue,
  }) async {
    final value = await getConfig(appName, environment, key);
    if (value == null) return defaultValue;

    if (value is bool) return value;
    if (value is String) {
      final lower = value.toLowerCase();
      return lower == 'true' || lower == '1' || lower == 'yes';
    }

    return defaultValue;
  }

  /// Get JSON configuration
  Future<T?> getJsonConfig<T>(
    String appName,
    String environment,
    String key, {
    T? defaultValue,
  }) async {
    final value = await getConfig(appName, environment, key);
    if (value == null) return defaultValue;

    try {
      if (value is String) {
        return json.decode(value) as T;
      }
      return value as T;
    } catch (e) {
      _logger.warning('Failed to parse JSON config $key: $e');
      return defaultValue;
    }
  }

  /// Create or update configuration
  Future<Configuration> setConfig({
    required String environmentId,
    required String key,
    required dynamic value,
    bool sensitive = false,
    String type = 'string',
    String? description,
  }) async {
    final url = Uri.parse('$_baseUrl/configurations');

    final body = json.encode({
      'environmentId': environmentId,
      'key': key,
      'value': value.toString(),
      'sensitive': sensitive,
      'type': type,
      'description': description,
    });

    try {
      final response = await _httpClient
          .post(url, headers: _headers, body: body)
          .timeout(Duration(seconds: options.timeout));

      if (response.statusCode != 200 && response.statusCode != 201) {
        throw _handleError(response);
      }

      clearCache();

      return Configuration.fromJson(json.decode(response.body));
    } catch (e) {
      if (e is ConfigHubException) rethrow;
      throw ConfigHubException('Failed to set configuration', e);
    }
  }

  /// Delete configuration
  Future<void> deleteConfig(String configId) async {
    final url = Uri.parse('$_baseUrl/configurations/$configId');

    try {
      final response = await _httpClient
          .delete(url, headers: _headers)
          .timeout(Duration(seconds: options.timeout));

      if (response.statusCode != 204) {
        throw _handleError(response);
      }

      clearCache();
    } catch (e) {
      if (e is ConfigHubException) rethrow;
      throw ConfigHubException('Failed to delete configuration', e);
    }
  }

  /// Refresh cache for specific app/environment
  Future<void> refreshCache(String appName, String environment) async {
    if (_cache != null) {
      final cacheKey = '$appName:$environment:true';
      _cache!.delete(cacheKey);
      await getConfigurations(appName, environment);
    }
  }

  /// Clear all cached configurations
  void clearCache() {
    _cache?.clear();
  }

  /// Get cache statistics
  Map<String, dynamic>? getCacheStats() {
    return _cache?.stats();
  }

  /// Close the client and release resources
  void dispose() {
    _httpClient.close();
    clearCache();
    _logger.info('ConfigHub client disposed');
  }

  Exception _handleError(http.Response response) {
    final statusCode = response.statusCode;
    String message;

    try {
      final body = json.decode(response.body);
      message = body['message'] ?? response.reasonPhrase ?? 'Unknown error';
    } catch (_) {
      message = response.reasonPhrase ?? 'Unknown error';
    }

    switch (statusCode) {
      case 401:
      case 403:
        return AuthenticationException(message);
      case 404:
        return NotFoundException(message);
      default:
        return ConfigHubException(message);
    }
  }
}
```

---

## 💾 Cache (cache.dart)

```dart
/// Simple in-memory cache with TTL
class ConfigCache {
  final Map<String, _CacheEntry> _cache = {};
  final Duration ttl;

  ConfigCache(this.ttl);

  Map<String, dynamic>? get(String key) {
    final entry = _cache[key];

    if (entry == null) return null;

    if (DateTime.now().isAfter(entry.expiresAt)) {
      _cache.remove(key);
      return null;
    }

    entry.hits++;
    return entry.value;
  }

  void set(String key, Map<String, dynamic> value) {
    _cache[key] = _CacheEntry(
      value: value,
      expiresAt: DateTime.now().add(ttl),
    );
  }

  void delete(String key) {
    _cache.remove(key);
  }

  void clear() {
    _cache.clear();
  }

  Map<String, dynamic> stats() {
    final entries = _cache.values;
    final totalHits = entries.fold<int>(0, (sum, e) => sum + e.hits);

    return {
      'size': _cache.length,
      'totalHits': totalHits,
      'averageHits': entries.isNotEmpty ? totalHits / entries.length : 0,
    };
  }
}

class _CacheEntry {
  final Map<String, dynamic> value;
  final DateTime expiresAt;
  int hits = 0;

  _CacheEntry({
    required this.value,
    required this.expiresAt,
  });
}
```

---

## 📤 Export (confighub_sdk.dart)

```dart
library confighub_sdk;

export 'src/client.dart';
export 'src/cache.dart';
export 'src/models/configuration.dart';
export 'src/models/options.dart';
export 'src/models/exceptions.dart';
```

---

## 📚 Usage Examples

### Basic Usage

```dart
import 'package:confighub_sdk/confighub_sdk.dart';

void main() async {
  final client = ConfigHubClient(
    ConfigHubOptions(
      baseUrl: 'https://config.yourcompany.com',
      apiKey: 'your-api-key',
    ),
  );

  try {
    // Get all configurations
    final configs = await client.getConfigurations('vendax', 'production');
    print('Configs: $configs');

    // Get specific config
    final dbUrl = await client.getConfig<String>(
      'vendax',
      'production',
      'database.url',
    );
    print('Database URL: $dbUrl');

    // Get with default value
    final maxRetries = await client.getIntConfig(
      'vendax',
      'production',
      'api.maxRetries',
      defaultValue: 3,
    );
    print('Max Retries: $maxRetries');

    // Get JSON config
    final features = await client.getJsonConfig<Map<String, dynamic>>(
      'vendax',
      'production',
      'features',
      defaultValue: {'aiEnabled': false},
    );
    print('Features: $features');
  } catch (e) {
    print('Error: $e');
  } finally {
    client.dispose();
  }
}
```

### Flutter Provider Integration

```dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:confighub_sdk/confighub_sdk.dart';

class ConfigProvider extends ChangeNotifier {
  final ConfigHubClient _client;
  Map<String, dynamic> _configs = {};
  bool _loading = true;
  String? _error;

  ConfigProvider(this._client);

  Map<String, dynamic> get configs => _configs;
  bool get loading => _loading;
  String? get error => _error;

  Future<void> loadConfigs(String appName, String environment) async {
    try {
      _loading = true;
      _error = null;
      notifyListeners();

      _configs = await _client.getConfigurations(appName, environment);
      _loading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _loading = false;
      notifyListeners();
    }
  }

  T? getConfig<T>(String key) {
    return _configs[key] as T?;
  }

  T getConfigWithDefault<T>(String key, T defaultValue) {
    return _configs[key] as T? ?? defaultValue;
  }

  @override
  void dispose() {
    _client.dispose();
    super.dispose();
  }
}

// Usage in app
void main() {
  final client = ConfigHubClient(
    ConfigHubOptions(
      baseUrl: const String.fromEnvironment('CONFIGHUB_URL'),
      apiKey: const String.fromEnvironment('CONFIGHUB_API_KEY'),
    ),
  );

  runApp(
    ChangeNotifierProvider(
      create: (_) => ConfigProvider(client)..loadConfigs('my-app', 'production'),
      child: const MyApp(),
    ),
  );
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Consumer<ConfigProvider>(
        builder: (context, config, child) {
          if (config.loading) {
            return const Scaffold(
              body: Center(child: CircularProgressIndicator()),
            );
          }

          if (config.error != null) {
            return Scaffold(
              body: Center(child: Text('Error: ${config.error}')),
            );
          }

          final apiEndpoint = config.getConfig<String>('api.endpoint');

          return Scaffold(
            appBar: AppBar(title: const Text('My App')),
            body: Center(child: Text('API: $apiEndpoint')),
          );
        },
      ),
    );
  }
}
```

### Riverpod Integration

```dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:confighub_sdk/confighub_sdk.dart';

// Provider for ConfigHub client
final configHubClientProvider = Provider<ConfigHubClient>((ref) {
  final client = ConfigHubClient(
    ConfigHubOptions(
      baseUrl: const String.fromEnvironment('CONFIGHUB_URL'),
      apiKey: const String.fromEnvironment('CONFIGHUB_API_KEY'),
    ),
  );

  ref.onDispose(() => client.dispose());

  return client;
});

// Provider for configurations
final configsProvider = FutureProvider.family<Map<String, dynamic>, ConfigParams>(
  (ref, params) async {
    final client = ref.watch(configHubClientProvider);
    return await client.getConfigurations(params.appName, params.environment);
  },
);

class ConfigParams {
  final String appName;
  final String environment;

  ConfigParams(this.appName, this.environment);
}

// Usage in widget
class MyWidget extends ConsumerWidget {
  const MyWidget({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final configsAsync = ref.watch(
      configsProvider(ConfigParams('my-app', 'production')),
    );

    return configsAsync.when(
      data: (configs) {
        final apiEndpoint = configs['api.endpoint'];
        return Text('API: $apiEndpoint');
      },
      loading: () => const CircularProgressIndicator(),
      error: (error, stack) => Text('Error: $error'),
    );
  }
}
```

---

## 🧪 Testing

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/annotations.dart';
import 'package:mockito/mockito.dart';
import 'package:confighub_sdk/confighub_sdk.dart';

@GenerateMocks([http.Client])
import 'client_test.mocks.dart';

void main() {
  group('ConfigHubClient', () {
    late MockClient mockClient;
    late ConfigHubClient client;

    setUp(() {
      mockClient = MockClient();
      client = ConfigHubClient(
        ConfigHubOptions(
          baseUrl: 'http://localhost:8080',
          apiKey: 'test-key',
          cacheEnabled: false,
        ),
      );
    });

    tearDown(() {
      client.dispose();
    });

    test('fetches configurations successfully', () async {
      when(mockClient.get(any, headers: anyNamed('headers')))
          .thenAnswer((_) async => http.Response(
                '{"key1": "value1", "key2": "value2"}',
                200,
              ));

      final configs = await client.getConfigurations('test-app', 'dev');

      expect(configs, isNotEmpty);
      expect(configs['key1'], equals('value1'));
    });

    test('handles authentication error', () async {
      when(mockClient.get(any, headers: anyNamed('headers')))
          .thenAnswer((_) async => http.Response(
                '{"message": "Unauthorized"}',
                401,
              ));

      expect(
        () => client.getConfigurations('test-app', 'dev'),
        throwsA(isA<AuthenticationException>()),
      );
    });
  });
}
```

---

## 📦 Publishing to pub.dev

```bash
# Check package
dart pub publish --dry-run

# Publish
dart pub publish
```

---

## 🚀 Installation

```yaml
dependencies:
  confighub_sdk: ^1.0.0
```

```bash
flutter pub get
```

**Continuar para:** 06-CLI.md
