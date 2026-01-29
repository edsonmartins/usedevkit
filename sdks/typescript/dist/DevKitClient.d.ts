import { FeatureFlagEvaluation, DevKitOptions } from './models';
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
export declare class DevKitClient {
    private readonly httpClient;
    private readonly cache?;
    private readonly cacheEnabled;
    private readonly cryptoUtil?;
    constructor(options: DevKitOptions);
    isFeatureEnabled(flagKey: string, userId: string): Promise<boolean>;
    isFeatureEnabledWithAttributes(flagKey: string, userId: string, attributes: Record<string, unknown>): Promise<boolean>;
    evaluateFeatureFlag(flagKey: string, userId: string, attributes?: Record<string, unknown>): Promise<FeatureFlagEvaluation>;
    getConfig(environmentId: string, key: string): Promise<string>;
    getConfig<T>(environmentId: string, key: string, type: 'string' | 'number' | 'boolean'): Promise<T>;
    private convertConfigValue;
    getConfigMap(environmentId: string): Promise<Record<string, string>>;
    getSecret(applicationId: string, environmentId: string, key: string): Promise<string>;
    getSecretMap(applicationId: string, environmentId: string): Promise<Record<string, string>>;
    invalidateCache(key: string): void;
    clearCache(): void;
    getCacheSize(): number;
    isCryptoEnabled(): boolean;
    getEncryptionKeyHash(): Promise<string | undefined>;
    private decryptIfNeeded;
    private decryptMapIfNeeded;
    private ensureCryptoEnabled;
}
//# sourceMappingURL=DevKitClient.d.ts.map