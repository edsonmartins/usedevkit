import 'cache.dart';
import 'http/http_client.dart';
import 'models/errors.dart';
import 'models/models.dart';

class DevKitClient {
  final HttpClient _httpClient;
  final Cache<dynamic>? _cache;
  final bool _cacheEnabled;

  DevKitClient({
    required String apiKey,
    String baseUrl = 'http://localhost:8080',
    Duration timeout = const Duration(milliseconds: 10000),
    Duration cacheExpireAfter = const Duration(minutes: 1),
    bool enableCache = true,
  })  : _httpClient = HttpClient(
          baseUrl: baseUrl,
          apiKey: apiKey,
          timeout: timeout,
        ),
        _cacheEnabled = enableCache,
        _cache =
            enableCache ? Cache<dynamic>(expireAfter: cacheExpireAfter) : null {
    if (apiKey.trim().isEmpty) {
      throw ArgumentError('API key is required');
    }
  }

  // ==================== Feature Flags ====================

  Future<bool> isFeatureEnabled(String flagKey, String userId) {
    return isFeatureEnabledWithAttributes(flagKey, userId, {});
  }

  Future<bool> isFeatureEnabledWithAttributes(
    String flagKey,
    String userId,
    Map<String, Object?> attributes,
  ) async {
    final evaluation = await evaluateFeatureFlag(flagKey, userId, attributes);
    return evaluation.enabled;
  }

  Future<FeatureFlagEvaluation> evaluateFeatureFlag(
    String flagKey,
    String userId, [
    Map<String, Object?> attributes = const {},
  ]) async {
    final cacheKey = 'flag:$flagKey:$userId';

    if (_cacheEnabled && _cache != null) {
      final cached = _cache!.get(cacheKey) as FeatureFlagEvaluation?;
      if (cached != null) return cached;
    }

    final evaluation = await _httpClient.post<Map<String, dynamic>>(
      '/api/v1/feature-flags/evaluate',
      {
        'flagKey': flagKey,
        'userId': userId,
        'attributes': attributes,
      },
    );

    final result = FeatureFlagEvaluation.fromJson(evaluation);

    if (_cacheEnabled && _cache != null) {
      _cache!.set(cacheKey, result);
    }

    return result;
  }

  // ==================== Configurations ====================

  Future<String> getConfig(String environmentId, String key) async {
    final cacheKey = 'config:$environmentId:$key';

    if (_cacheEnabled && _cache != null) {
      final cached = _cache!.get(cacheKey) as String?;
      if (cached != null) return cached;
    }

    final config = await _httpClient.get<Map<String, dynamic>>(
      '/api/v1/configurations/environment/$environmentId/key/$key',
    );

    final value = Configuration.fromJson(config).value;

    if (_cacheEnabled && _cache != null) {
      _cache!.set(cacheKey, value);
    }

    return value;
  }

  Future<T> getConfigWithType<T>(
    String environmentId,
    String key,
    String type,
  ) async {
    final value = await getConfig(environmentId, key);

    switch (type) {
      case 'string':
        return value as T;
      case 'int':
        return int.parse(value) as T;
      case 'double':
        return double.parse(value) as T;
      case 'bool':
        return (value.toLowerCase() == 'true') as T;
      default:
        throw DevKitError('Unsupported type: $type');
    }
  }

  Future<Map<String, String>> getConfigMap(String environmentId) async {
    final cacheKey = 'config_map:$environmentId';

    if (_cacheEnabled && _cache != null) {
      final cached = _cache!.get(cacheKey) as Map<String, String>?;
      if (cached != null) return cached;
    }

    final configMap = await _httpClient.get<Map<String, dynamic>>(
      '/api/v1/configurations/environment/$environmentId/map',
    );

    final map = configMap.map((key, value) => MapEntry(key, value.toString()));

    if (_cacheEnabled && _cache != null) {
      _cache!.set(cacheKey, map);
    }

    return map;
  }

  // ==================== Secrets ====================

  Future<String> getSecret(
    String applicationId,
    String environmentId,
    String key,
  ) async {
    final cacheKey = 'secret:$applicationId:$environmentId:$key';

    if (_cacheEnabled && _cache != null) {
      final cached = _cache!.get(cacheKey) as String?;
      if (cached != null) return cached;
    }

    final secret = await _httpClient.get<Map<String, dynamic>>(
      '/api/v1/secrets/$key/decrypt',
    );

    final value = Secret.fromJson(secret).decryptedValue;

    if (_cacheEnabled && _cache != null) {
      _cache!.set(cacheKey, value);
    }

    return value;
  }

  Future<Map<String, String>> getSecretMap(
    String applicationId,
    String environmentId,
  ) async {
    final cacheKey = 'secret_map:$applicationId:$environmentId';

    if (_cacheEnabled && _cache != null) {
      final cached = _cache!.get(cacheKey) as Map<String, String>?;
      if (cached != null) return cached;
    }

    final secretMap = await _httpClient.get<Map<String, dynamic>>(
      '/api/v1/secrets/application/$applicationId/environment/$environmentId/map',
    );

    final map = secretMap.map((key, value) => MapEntry(key, value.toString()));

    if (_cacheEnabled && _cache != null) {
      _cache!.set(cacheKey, map);
    }

    return map;
  }

  // ==================== Cache Management ====================

  void invalidateCache(String key) {
    if (_cacheEnabled && _cache != null) {
      _cache!.invalidate(key);
    }
  }

  void clearCache() {
    if (_cacheEnabled && _cache != null) {
      _cache!.invalidateAll();
    }
  }

  int get cacheSize => _cacheEnabled && _cache != null ? _cache!.size : 0;
}
