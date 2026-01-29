"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DevKitClient = void 0;
const HttpClient_1 = require("./http/HttpClient");
const Cache_1 = require("./Cache");
const CryptoUtil_1 = require("./crypto/CryptoUtil");
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
class DevKitClient {
    constructor(options) {
        if (!options.apiKey) {
            throw new Error('API key is required');
        }
        this.httpClient = new HttpClient_1.HttpClient(options.baseUrl || 'http://localhost:8080', options.apiKey, options.timeout || 10000);
        this.cacheEnabled = options.enableCache !== false;
        if (this.cacheEnabled) {
            this.cache = new Cache_1.Cache(options.cacheExpireAfter || 60000);
        }
        // Initialize CryptoUtil with encryption key from options or environment variable
        const encryptionKey = (0, CryptoUtil_1.getEncryptionKey)(options.encryptionKey);
        if (encryptionKey) {
            this.cryptoUtil = new CryptoUtil_1.CryptoUtil(encryptionKey);
        }
    }
    // ==================== Feature Flags ====================
    async isFeatureEnabled(flagKey, userId) {
        return this.isFeatureEnabledWithAttributes(flagKey, userId, {});
    }
    async isFeatureEnabledWithAttributes(flagKey, userId, attributes) {
        const evaluation = await this.evaluateFeatureFlag(flagKey, userId, attributes);
        return evaluation.enabled;
    }
    async evaluateFeatureFlag(flagKey, userId, attributes = {}) {
        const cacheKey = `flag:${flagKey}:${userId}`;
        if (this.cacheEnabled && this.cache) {
            const cached = this.cache.get(cacheKey);
            if (cached)
                return cached;
        }
        const evaluation = await this.httpClient.post('/api/v1/feature-flags/evaluate', { flagKey, userId, attributes });
        if (this.cacheEnabled && this.cache) {
            this.cache.set(cacheKey, evaluation);
        }
        return evaluation;
    }
    async getConfig(environmentId, key, type) {
        const cacheKey = `config:${environmentId}:${key}`;
        if (this.cacheEnabled && this.cache) {
            const cached = this.cache.get(cacheKey);
            if (cached !== undefined) {
                return this.convertConfigValue(cached, type);
            }
        }
        const config = await this.httpClient.get(`/api/v1/configurations/environment/${environmentId}/key/${key}`);
        const value = await this.decryptIfNeeded(config.value);
        if (this.cacheEnabled && this.cache) {
            this.cache.set(cacheKey, value);
        }
        return this.convertConfigValue(value, type);
    }
    convertConfigValue(value, type) {
        if (!type)
            return value;
        switch (type) {
            case 'string':
                return value;
            case 'number': {
                const num = Number(value);
                if (isNaN(num)) {
                    throw new Error(`Configuration value '${value}' cannot be parsed as number`);
                }
                return num;
            }
            case 'boolean':
                return (value.toLowerCase() === 'true');
            default:
                throw new Error(`Unsupported type: ${type}`);
        }
    }
    async getConfigMap(environmentId) {
        const cacheKey = `config_map:${environmentId}`;
        if (this.cacheEnabled && this.cache) {
            const cached = this.cache.get(cacheKey);
            if (cached)
                return cached;
        }
        const configMap = await this.httpClient.get(`/api/v1/configurations/environment/${environmentId}/map`);
        const decryptedMap = await this.decryptMapIfNeeded(configMap);
        if (this.cacheEnabled && this.cache) {
            this.cache.set(cacheKey, decryptedMap);
        }
        return decryptedMap;
    }
    // ==================== Secrets ====================
    async getSecret(applicationId, environmentId, key) {
        this.ensureCryptoEnabled('Secrets require an encryption key to be configured');
        const cacheKey = `secret:${applicationId}:${environmentId}:${key}`;
        if (this.cacheEnabled && this.cache) {
            const cached = this.cache.get(cacheKey);
            if (cached !== undefined) {
                return cached;
            }
        }
        const secretMap = await this.httpClient.get(`/api/v1/secrets/application/${applicationId}/environment/${environmentId}/map`);
        const encryptedValue = secretMap[key];
        if (!encryptedValue) {
            throw new Error(`Secret not found: ${key}`);
        }
        const decryptedValue = await this.cryptoUtil.decrypt(encryptedValue);
        if (this.cacheEnabled && this.cache) {
            this.cache.set(cacheKey, decryptedValue);
        }
        return decryptedValue;
    }
    async getSecretMap(applicationId, environmentId) {
        this.ensureCryptoEnabled('Secrets require an encryption key to be configured');
        const cacheKey = `secret_map:${applicationId}:${environmentId}`;
        if (this.cacheEnabled && this.cache) {
            const cached = this.cache.get(cacheKey);
            if (cached) {
                return cached;
            }
        }
        const secretMap = await this.httpClient.get(`/api/v1/secrets/application/${applicationId}/environment/${environmentId}/map`);
        const decryptedMap = {};
        const failedKeys = [];
        for (const [key, value] of Object.entries(secretMap)) {
            try {
                decryptedMap[key] = await this.cryptoUtil.decrypt(value);
            }
            catch {
                failedKeys.push(key);
            }
        }
        if (failedKeys.length > 0) {
            throw new Error(`Failed to decrypt ${failedKeys.length} secret(s): ${failedKeys.join(', ')}. ` +
                'Verify your DEVKIT_ENCRYPTION_KEY is correct.');
        }
        if (this.cacheEnabled && this.cache) {
            this.cache.set(cacheKey, decryptedMap);
        }
        return decryptedMap;
    }
    // ==================== Cache Management ====================
    invalidateCache(key) {
        if (this.cacheEnabled && this.cache) {
            this.cache.invalidate(key);
        }
    }
    clearCache() {
        if (this.cacheEnabled && this.cache) {
            this.cache.invalidateAll();
        }
    }
    getCacheSize() {
        if (!this.cacheEnabled || !this.cache) {
            return 0;
        }
        return this.cache.size;
    }
    // ==================== Encryption Utilities ====================
    isCryptoEnabled() {
        return this.cryptoUtil !== undefined;
    }
    async getEncryptionKeyHash() {
        if (!this.cryptoUtil) {
            return undefined;
        }
        return await this.cryptoUtil.getKeyHash();
    }
    // ==================== Private Methods ====================
    async decryptIfNeeded(value) {
        if (!value || value.length === 0) {
            return value;
        }
        if (!this.cryptoUtil) {
            return value;
        }
        if (!CryptoUtil_1.CryptoUtil.isEncrypted(value)) {
            return value;
        }
        return await this.cryptoUtil.decrypt(value);
    }
    async decryptMapIfNeeded(map) {
        if (!map || Object.keys(map).length === 0) {
            return map;
        }
        if (!this.cryptoUtil) {
            return map;
        }
        const result = {};
        for (const [key, value] of Object.entries(map)) {
            result[key] = await this.decryptIfNeeded(value);
        }
        return result;
    }
    ensureCryptoEnabled(message) {
        if (!this.cryptoUtil) {
            throw new Error(message + '. Please set DEVKIT_ENCRYPTION_KEY environment variable ' +
                'or provide encryptionKey in the options.');
        }
    }
}
exports.DevKitClient = DevKitClient;
//# sourceMappingURL=DevKitClient.js.map