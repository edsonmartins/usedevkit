import { HttpClient } from './http/HttpClient';
import { Cache } from './Cache';
import {
  Configuration,
  Secret,
  FeatureFlag,
  FeatureFlagEvaluation,
  DevKitOptions,
} from './models';

export class DevKitClient {
  private readonly httpClient: HttpClient;
  private readonly cache?: Cache<unknown>;
  private readonly cacheEnabled: boolean;

  constructor(options: DevKitOptions) {
    if (!options.apiKey) {
      throw new Error('API key is required');
    }

    this.httpClient = new HttpClient(
      options.baseUrl || 'http://localhost:8080',
      options.apiKey,
      options.timeout || 10000
    );

    this.cacheEnabled = options.enableCache !== false;
    if (this.cacheEnabled) {
      this.cache = new Cache(options.cacheExpireAfter || 60000);
    }
  }

  // ==================== Feature Flags ====================

  async isFeatureEnabled(flagKey: string, userId: string): Promise<boolean> {
    return this.isFeatureEnabledWithAttributes(flagKey, userId, {});
  }

  async isFeatureEnabledWithAttributes(
    flagKey: string,
    userId: string,
    attributes: Record<string, unknown>
  ): Promise<boolean> {
    const evaluation = await this.evaluateFeatureFlag(flagKey, userId, attributes);
    return evaluation.enabled;
  }

  async evaluateFeatureFlag(flagKey: string, userId: string): Promise<FeatureFlagEvaluation> {
    return this.evaluateFeatureFlag(flagKey, userId, {});
  }

  async evaluateFeatureFlag(
    flagKey: string,
    userId: string,
    attributes: Record<string, unknown>
  ): Promise<FeatureFlagEvaluation> {
    const cacheKey = `flag:${flagKey}:${userId}`;

    if (this.cacheEnabled && this.cache) {
      const cached = this.cache.get<FeatureFlagEvaluation>(cacheKey);
      if (cached) return cached;
    }

    const evaluation = await this.httpClient.post<FeatureFlagEvaluation>(
      '/api/v1/feature-flags/evaluate',
      { flagKey, userId, attributes }
    );

    if (this.cacheEnabled && this.cache) {
      this.cache.set(cacheKey, evaluation);
    }

    return evaluation;
  }

  // ==================== Configurations ====================

  async getConfig(environmentId: string, key: string): Promise<string> {
    const cacheKey = `config:${environmentId}:${key}`;

    if (this.cacheEnabled && this.cache) {
      const cached = this.cache.get<string>(cacheKey);
      if (cached !== undefined) return cached;
    }

    const config = await this.httpClient.get<Configuration>(
      `/api/v1/configurations/environment/${environmentId}/key/${key}`
    );

    if (this.cacheEnabled && this.cache) {
      this.cache.set(cacheKey, config.value);
    }

    return config.value;
  }

  async getConfig<T extends string | number | boolean>(
    environmentId: string,
    key: string,
    type: 'string' | 'number' | 'boolean'
  ): Promise<T> {
    const value = await this.getConfig(environmentId, key);

    switch (type) {
      case 'string':
        return value as T;
      case 'number':
        return Number(value) as T;
      case 'boolean':
        return (value.toLowerCase() === 'true') as T;
      default:
        throw new Error(`Unsupported type: ${type}`);
    }
  }

  async getConfigMap(environmentId: string): Promise<Record<string, string>> {
    const cacheKey = `config_map:${environmentId}`;

    if (this.cacheEnabled && this.cache) {
      const cached = this.cache.get<Record<string, string>>(cacheKey);
      if (cached) return cached;
    }

    const configMap = await this.httpClient.get<Record<string, string>>(
      `/api/v1/configurations/environment/${environmentId}/map`
    );

    if (this.cacheEnabled && this.cache) {
      this.cache.set(cacheKey, configMap);
    }

    return configMap;
  }

  // ==================== Secrets ====================

  async getSecret(applicationId: string, environmentId: string, key: string): Promise<string> {
    const cacheKey = `secret:${applicationId}:${environmentId}:${key}`;

    if (this.cacheEnabled && this.cache) {
      const cached = this.cache.get<string>(cacheKey);
      if (cached !== undefined) return cached;
    }

    const secret = await this.httpClient.get<Secret>(`/api/v1/secrets/${key}/decrypt`);

    if (this.cacheEnabled && this.cache) {
      this.cache.set(cacheKey, secret.decryptedValue);
    }

    return secret.decryptedValue;
  }

  async getSecretMap(applicationId: string, environmentId: string): Promise<Record<string, string>> {
    const cacheKey = `secret_map:${applicationId}:${environmentId}`;

    if (this.cacheEnabled && this.cache) {
      const cached = this.cache.get<Record<string, string>>(cacheKey);
      if (cached) return cached;
    }

    const secretMap = await this.httpClient.get<Record<string, string>>(
      `/api/v1/secrets/application/${applicationId}/environment/${environmentId}/map`
    );

    if (this.cacheEnabled && this.cache) {
      this.cache.set(cacheKey, secretMap);
    }

    return secretMap;
  }

  // ==================== Cache Management ====================

  invalidateCache(key: string): void {
    if (this.cacheEnabled && this.cache) {
      this.cache.invalidate(key);
    }
  }

  clearCache(): void {
    if (this.cacheEnabled && this.cache) {
      this.cache.invalidateAll();
    }
  }

  getCacheSize(): number {
    if (!this.cacheEnabled || !this.cache) return 0;
    return this.cache.size;
  }
}
