import { HttpClient } from './http/HttpClient';
import { Cache } from './Cache';
import { CryptoUtil, DecryptionException, getEncryptionKey } from './crypto/CryptoUtil';
import {
  Configuration,
  Secret,
  FeatureFlag,
  FeatureFlagEvaluation,
  DevKitOptions,
} from './models';

/**
 * Main client for interacting with DevKit API.
 * Supports Configurations, Secrets, and Feature Flags.
 *
 * Client-side decryption is performed using the application's encryption key,
 * which can be configured via:
 * - Environment variable: DEVKIT_ENCRYPTION_KEY
 * - Option: encryptionKey in DevKitOptions
 *
 * Error Handling:
 * This client propagates all exceptions to the calling code.
 * Network errors, decryption failures, and invalid responses are not silently handled.
 * Decryption failures throw DecryptionException with detailed error messages.
 * Use appropriate try-catch blocks or error handling mechanisms in your application.
 */
export class DevKitClient {
  private readonly httpClient: HttpClient;
  private readonly cache?: Cache<unknown>;
  private readonly cacheEnabled: boolean;
  private readonly cryptoUtil?: CryptoUtil;

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

    // Initialize CryptoUtil with encryption key from options or environment variable
    const encryptionKey = getEncryptionKey(options.encryptionKey);
    if (encryptionKey) {
      this.cryptoUtil = new CryptoUtil(encryptionKey);
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

  async evaluateFeatureFlag(
    flagKey: string,
    userId: string,
    attributes: Record<string, unknown> = {}
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

  async getConfig(environmentId: string, key: string): Promise<string>;
  async getConfig<T>(environmentId: string, key: string, type: 'string' | 'number' | 'boolean'): Promise<T>;
  async getConfig<T>(
    environmentId: string,
    key: string,
    type?: 'string' | 'number' | 'boolean'
  ): Promise<string | T> {
    const cacheKey = `config:${environmentId}:${key}`;

    if (this.cacheEnabled && this.cache) {
      const cached = this.cache.get<string>(cacheKey);
      if (cached !== undefined) {
        return this.convertConfigValue<T>(cached, type);
      }
    }

    const config = await this.httpClient.get<Configuration>(
      `/api/v1/configurations/environment/${environmentId}/key/${key}`
    );

    const value = await this.decryptIfNeeded(config.value);

    if (this.cacheEnabled && this.cache) {
      this.cache.set(cacheKey, value);
    }

    return this.convertConfigValue(value, type);
  }

  private convertConfigValue<T>(
    value: string,
    type?: 'string' | 'number' | 'boolean'
  ): string | T {
    if (!type) return value as T;

    switch (type) {
      case 'string':
        return value as T;
      case 'number': {
        const num = Number(value);
        if (isNaN(num)) {
          throw new Error(
            `Configuration value '${value}' cannot be parsed as number`
          );
        }
        return num as T;
      }
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

    const decryptedMap = await this.decryptMapIfNeeded(configMap);

    if (this.cacheEnabled && this.cache) {
      this.cache.set(cacheKey, decryptedMap);
    }

    return decryptedMap;
  }

  // ==================== Secrets ====================

  async getSecret(applicationId: string, environmentId: string, key: string): Promise<string> {
    this.ensureCryptoEnabled('Secrets require an encryption key to be configured');

    const cacheKey = `secret:${applicationId}:${environmentId}:${key}`;

    if (this.cacheEnabled && this.cache) {
      const cached = this.cache.get<string>(cacheKey);
      if (cached !== undefined) {
        return cached;
      }
    }

    const secretMap = await this.httpClient.get<Record<string, string>>(
      `/api/v1/secrets/application/${applicationId}/environment/${environmentId}/map`
    );

    const encryptedValue = secretMap[key];
    if (!encryptedValue) {
      throw new Error(`Secret not found: ${key}`);
    }

    const decryptedValue = await this.cryptoUtil!.decrypt(encryptedValue);

    if (this.cacheEnabled && this.cache) {
      this.cache.set(cacheKey, decryptedValue);
    }

    return decryptedValue;
  }

  async getSecretMap(applicationId: string, environmentId: string): Promise<Record<string, string>> {
    this.ensureCryptoEnabled('Secrets require an encryption key to be configured');

    const cacheKey = `secret_map:${applicationId}:${environmentId}`;

    if (this.cacheEnabled && this.cache) {
      const cached = this.cache.get<Record<string, string>>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    const secretMap = await this.httpClient.get<Record<string, string>>(
      `/api/v1/secrets/application/${applicationId}/environment/${environmentId}/map`
    );

    const decryptedMap: Record<string, string> = {};
    const failedKeys: string[] = [];
    for (const [key, value] of Object.entries(secretMap)) {
      try {
        decryptedMap[key] = await this.cryptoUtil!.decrypt(value);
      } catch {
        failedKeys.push(key);
      }
    }

    if (failedKeys.length > 0) {
      throw new Error(
        `Failed to decrypt ${failedKeys.length} secret(s): ${failedKeys.join(', ')}. ` +
        'Verify your DEVKIT_ENCRYPTION_KEY is correct.'
      );
    }

    if (this.cacheEnabled && this.cache) {
      this.cache.set(cacheKey, decryptedMap);
    }

    return decryptedMap;
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
    if (!this.cacheEnabled || !this.cache) {
      return 0;
    }
    return this.cache.size;
  }

  // ==================== Encryption Utilities ====================

  isCryptoEnabled(): boolean {
    return this.cryptoUtil !== undefined;
  }

  async getEncryptionKeyHash(): Promise<string | undefined> {
    if (!this.cryptoUtil) {
      return undefined;
    }
    return await this.cryptoUtil.getKeyHash();
  }

  // ==================== Private Methods ====================

  private async decryptIfNeeded(value: string): Promise<string> {
    if (!value || value.length === 0) {
      return value;
    }

    if (!this.cryptoUtil) {
      return value;
    }

    if (!CryptoUtil.isEncrypted(value)) {
      return value;
    }

    return await this.cryptoUtil.decrypt(value);
  }

  private async decryptMapIfNeeded(map: Record<string, string>): Promise<Record<string, string>> {
    if (!map || Object.keys(map).length === 0) {
      return map;
    }

    if (!this.cryptoUtil) {
      return map;
    }

    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(map)) {
      result[key] = await this.decryptIfNeeded(value);
    }
    return result;
  }

  private ensureCryptoEnabled(message: string): void {
    if (!this.cryptoUtil) {
      throw new Error(
        message + '. Please set DEVKIT_ENCRYPTION_KEY environment variable ' +
          'or provide encryptionKey in the options.'
      );
    }
  }
}
