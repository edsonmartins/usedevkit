# ConfigHub - SDK TypeScript/JavaScript

## 📦 Estrutura do Projeto

```
sdk-typescript/
├── src/
│   ├── client.ts
│   ├── cache.ts
│   ├── types.ts
│   ├── errors.ts
│   ├── utils.ts
│   └── index.ts
├── tests/
│   ├── client.test.ts
│   └── cache.test.ts
├── package.json
├── tsconfig.json
├── .npmignore
└── README.md
```

---

## 📦 package.json

```json
{
  "name": "@confighub/sdk",
  "version": "1.0.0",
  "description": "TypeScript/JavaScript client library for ConfigHub",
  "main": "dist/index.js",
  "module": "dist/index.mjs",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ],
  "scripts": {
    "build": "tsup src/index.ts --format cjs,esm --dts --clean",
    "dev": "tsup src/index.ts --format cjs,esm --dts --watch",
    "test": "vitest",
    "test:coverage": "vitest --coverage",
    "lint": "eslint src --ext .ts",
    "prepublishOnly": "npm run build"
  },
  "keywords": [
    "config",
    "configuration",
    "secrets",
    "vault",
    "confighub"
  ],
  "author": "ConfigHub Team",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/confighub/confighub"
  },
  "dependencies": {
    "axios": "^1.6.5",
    "axios-retry": "^4.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.6",
    "@typescript-eslint/eslint-plugin": "^6.17.0",
    "@typescript-eslint/parser": "^6.17.0",
    "eslint": "^8.56.0",
    "tsup": "^8.0.1",
    "typescript": "^5.3.3",
    "vitest": "^1.1.1"
  },
  "engines": {
    "node": ">=16.0.0"
  }
}
```

---

## ⚙️ tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020"],
    "moduleResolution": "node",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

---

## 🎯 Types (types.ts)

```typescript
/**
 * Configuration value types
 */
export type ConfigValue = string | number | boolean | object | null;

/**
 * Configuration map
 */
export interface ConfigMap {
  [key: string]: ConfigValue;
}

/**
 * Configuration item with metadata
 */
export interface Configuration {
  id: string;
  key: string;
  value?: ConfigValue;
  sensitive: boolean;
  type: 'string' | 'int' | 'boolean' | 'json';
  description?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  updatedBy?: string;
}

/**
 * Client configuration options
 */
export interface ConfigHubOptions {
  /**
   * Base URL of ConfigHub server
   */
  baseUrl: string;

  /**
   * API key for authentication
   */
  apiKey: string;

  /**
   * Request timeout in milliseconds
   * @default 30000
   */
  timeout?: number;

  /**
   * Enable caching of configurations
   * @default true
   */
  cacheEnabled?: boolean;

  /**
   * Cache TTL in milliseconds
   * @default 300000 (5 minutes)
   */
  cacheTtl?: number;

  /**
   * Number of retry attempts for failed requests
   * @default 3
   */
  maxRetries?: number;

  /**
   * Custom headers to include in requests
   */
  headers?: Record<string, string>;
}

/**
 * API error response
 */
export interface ErrorResponse {
  message: string;
  code?: string;
  details?: Record<string, any>;
}
```

---

## 🔧 Client (client.ts)

```typescript
import axios, { AxiosInstance, AxiosError } from 'axios';
import axiosRetry from 'axios-retry';
import { ConfigCache } from './cache';
import { ConfigHubError, AuthenticationError, NotFoundError } from './errors';
import type { ConfigHubOptions, ConfigMap, Configuration } from './types';

/**
 * ConfigHub client for managing configurations
 */
export class ConfigHubClient {
  private readonly httpClient: AxiosInstance;
  private readonly cache?: ConfigCache;
  private readonly cacheEnabled: boolean;

  constructor(options: ConfigHubOptions) {
    this.validateOptions(options);

    const baseUrl = options.baseUrl.endsWith('/')
      ? options.baseUrl
      : `${options.baseUrl}/`;

    this.cacheEnabled = options.cacheEnabled ?? true;
    this.cache = this.cacheEnabled
      ? new ConfigCache(options.cacheTtl ?? 5 * 60 * 1000)
      : undefined;

    this.httpClient = axios.create({
      baseURL: `${baseUrl}api/v1`,
      timeout: options.timeout ?? 30000,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': options.apiKey,
        'User-Agent': 'ConfigHub-TS-SDK/1.0.0',
        ...options.headers,
      },
    });

    // Configure retries
    axiosRetry(this.httpClient, {
      retries: options.maxRetries ?? 3,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: (error) => {
        return axiosRetry.isNetworkOrIdempotentRequestError(error) 
          || error.response?.status === 429; // Retry on rate limit
      },
    });

    // Response interceptor for error handling
    this.httpClient.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        return Promise.reject(this.handleError(error));
      }
    );
  }

  /**
   * Get all configurations for an application and environment
   */
  async getConfigurations(
    appName: string,
    environment: string,
    includeValues = true
  ): Promise<ConfigMap> {
    const cacheKey = `${appName}:${environment}:${includeValues}`;

    // Check cache
    if (this.cacheEnabled && this.cache) {
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      const response = await this.httpClient.get<ConfigMap>(
        `/configurations/app/${appName}/env/${environment}`,
        {
          params: { includeValues },
        }
      );

      const configs = response.data;

      // Store in cache
      if (this.cacheEnabled && this.cache) {
        this.cache.set(cacheKey, configs);
      }

      return configs;
    } catch (error) {
      throw error instanceof ConfigHubError ? error : new ConfigHubError(
        'Failed to fetch configurations',
        error as Error
      );
    }
  }

  /**
   * Get a single configuration value
   */
  async getConfig<T = string>(
    appName: string,
    environment: string,
    key: string
  ): Promise<T | null> {
    const configs = await this.getConfigurations(appName, environment, true);
    return (configs[key] as T) ?? null;
  }

  /**
   * Get configuration with default value
   */
  async getConfigWithDefault<T = string>(
    appName: string,
    environment: string,
    key: string,
    defaultValue: T
  ): Promise<T> {
    try {
      const value = await this.getConfig<T>(appName, environment, key);
      return value ?? defaultValue;
    } catch (error) {
      console.warn(`Failed to get config ${key}, using default:`, error);
      return defaultValue;
    }
  }

  /**
   * Get integer configuration
   */
  async getIntConfig(
    appName: string,
    environment: string,
    key: string,
    defaultValue?: number
  ): Promise<number | null> {
    const value = await this.getConfig(appName, environment, key);
    if (value === null) return defaultValue ?? null;

    const parsed = parseInt(String(value), 10);
    if (isNaN(parsed)) {
      console.warn(`Config ${key} is not a valid integer`);
      return defaultValue ?? null;
    }

    return parsed;
  }

  /**
   * Get boolean configuration
   */
  async getBooleanConfig(
    appName: string,
    environment: string,
    key: string,
    defaultValue?: boolean
  ): Promise<boolean | null> {
    const value = await this.getConfig(appName, environment, key);
    if (value === null) return defaultValue ?? null;

    const str = String(value).toLowerCase();
    return str === 'true' || str === '1' || str === 'yes';
  }

  /**
   * Get JSON configuration
   */
  async getJsonConfig<T = any>(
    appName: string,
    environment: string,
    key: string,
    defaultValue?: T
  ): Promise<T | null> {
    const value = await this.getConfig(appName, environment, key);
    if (value === null) return defaultValue ?? null;

    try {
      return typeof value === 'string' ? JSON.parse(value) : value;
    } catch (error) {
      console.warn(`Failed to parse JSON config ${key}:`, error);
      return defaultValue ?? null;
    }
  }

  /**
   * Create or update configuration
   */
  async setConfig(
    environmentId: string,
    key: string,
    value: any,
    options?: {
      sensitive?: boolean;
      type?: 'string' | 'int' | 'boolean' | 'json';
      description?: string;
    }
  ): Promise<Configuration> {
    try {
      const response = await this.httpClient.post<Configuration>('/configurations', {
        environmentId,
        key,
        value: String(value),
        sensitive: options?.sensitive ?? false,
        type: options?.type ?? 'string',
        description: options?.description,
      });

      // Invalidate cache
      this.clearCache();

      return response.data;
    } catch (error) {
      throw new ConfigHubError('Failed to set configuration', error as Error);
    }
  }

  /**
   * Delete configuration
   */
  async deleteConfig(configId: string): Promise<void> {
    try {
      await this.httpClient.delete(`/configurations/${configId}`);
      this.clearCache();
    } catch (error) {
      throw new ConfigHubError('Failed to delete configuration', error as Error);
    }
  }

  /**
   * Refresh cache for specific app/environment
   */
  async refreshCache(appName: string, environment: string): Promise<void> {
    if (this.cache) {
      const cacheKey = `${appName}:${environment}:true`;
      this.cache.delete(cacheKey);
      await this.getConfigurations(appName, environment, true);
    }
  }

  /**
   * Clear all cached configurations
   */
  clearCache(): void {
    this.cache?.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return this.cache?.stats();
  }

  private validateOptions(options: ConfigHubOptions): void {
    if (!options.baseUrl) {
      throw new Error('baseUrl is required');
    }
    if (!options.apiKey) {
      throw new Error('apiKey is required');
    }
  }

  private handleError(error: AxiosError): Error {
    if (error.response) {
      const status = error.response.status;
      const message = (error.response.data as any)?.message || error.message;

      switch (status) {
        case 401:
        case 403:
          return new AuthenticationError(message);
        case 404:
          return new NotFoundError(message);
        default:
          return new ConfigHubError(message);
      }
    }

    return new ConfigHubError(error.message, error);
  }
}
```

---

## 💾 Cache (cache.ts)

```typescript
/**
 * Simple in-memory cache with TTL
 */
export class ConfigCache {
  private cache = new Map<string, CacheEntry>();
  private readonly ttl: number;

  constructor(ttl: number) {
    this.ttl = ttl;
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    entry.hits++;
    return entry.value;
  }

  set(key: string, value: any): void {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + this.ttl,
      hits: 0,
    });
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  stats() {
    const entries = Array.from(this.cache.values());
    return {
      size: this.cache.size,
      totalHits: entries.reduce((sum, e) => sum + e.hits, 0),
      averageHits: entries.length > 0
        ? entries.reduce((sum, e) => sum + e.hits, 0) / entries.length
        : 0,
    };
  }
}

interface CacheEntry {
  value: any;
  expiresAt: number;
  hits: number;
}
```

---

## ❌ Errors (errors.ts)

```typescript
/**
 * Base error class for ConfigHub
 */
export class ConfigHubError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = 'ConfigHubError';
  }
}

/**
 * Authentication/Authorization error
 */
export class AuthenticationError extends ConfigHubError {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

/**
 * Resource not found error
 */
export class NotFoundError extends ConfigHubError {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}
```

---

## 📤 Export (index.ts)

```typescript
export { ConfigHubClient } from './client';
export { ConfigCache } from './cache';
export * from './types';
export * from './errors';

// Re-export for convenience
export default ConfigHubClient;
```

---

## 📚 Usage Examples

### Node.js / CommonJS

```javascript
const { ConfigHubClient } = require('@confighub/sdk');

const client = new ConfigHubClient({
  baseUrl: 'https://config.yourcompany.com',
  apiKey: process.env.CONFIGHUB_API_KEY,
});

async function main() {
  // Get all configurations
  const configs = await client.getConfigurations('vendax', 'production');
  console.log(configs);

  // Get specific config
  const dbUrl = await client.getConfig('vendax', 'production', 'database.url');
  console.log('Database URL:', dbUrl);

  // Get with default value
  const maxRetries = await client.getIntConfig(
    'vendax',
    'production',
    'api.maxRetries',
    3
  );
  console.log('Max Retries:', maxRetries);

  // Get JSON config
  const features = await client.getJsonConfig(
    'vendax',
    'production',
    'features',
    { aiEnabled: false }
  );
  console.log('Features:', features);
}

main().catch(console.error);
```

### TypeScript / ES Modules

```typescript
import { ConfigHubClient } from '@confighub/sdk';

const client = new ConfigHubClient({
  baseUrl: 'https://config.yourcompany.com',
  apiKey: process.env.CONFIGHUB_API_KEY!,
  cacheEnabled: true,
  cacheTtl: 5 * 60 * 1000, // 5 minutes
});

async function loadConfig() {
  const dbConfig = await client.getJsonConfig<DatabaseConfig>(
    'my-app',
    'production',
    'database'
  );

  return {
    host: dbConfig?.host || 'localhost',
    port: dbConfig?.port || 5432,
    database: dbConfig?.database || 'mydb',
  };
}

interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
}
```

### React Integration

```typescript
import { ConfigHubClient } from '@confighub/sdk';
import { createContext, useContext, useEffect, useState } from 'react';

// Create context
const ConfigContext = createContext<Record<string, any>>({});

// Provider component
export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const client = new ConfigHubClient({
      baseUrl: import.meta.env.VITE_CONFIGHUB_URL,
      apiKey: import.meta.env.VITE_CONFIGHUB_API_KEY,
    });

    client
      .getConfigurations('my-app', 'production')
      .then(setConfig)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div>Loading configuration...</div>;
  }

  return (
    <ConfigContext.Provider value={config}>
      {children}
    </ConfigContext.Provider>
  );
}

// Hook to use config
export function useConfig<T = string>(key: string, defaultValue?: T): T {
  const config = useContext(ConfigContext);
  return (config[key] as T) ?? defaultValue;
}

// Usage in component
function MyComponent() {
  const apiEndpoint = useConfig('api.endpoint', 'https://api.default.com');
  const maxRetries = useConfig<number>('api.maxRetries', 3);

  return <div>API: {apiEndpoint}</div>;
}
```

### Next.js Integration

```typescript
// lib/config.ts
import { ConfigHubClient } from '@confighub/sdk';

const client = new ConfigHubClient({
  baseUrl: process.env.CONFIGHUB_URL!,
  apiKey: process.env.CONFIGHUB_API_KEY!,
});

export async function getServerConfig() {
  return await client.getConfigurations(
    process.env.APP_NAME!,
    process.env.NODE_ENV
  );
}

// app/page.tsx
export default async function Page() {
  const config = await getServerConfig();

  return (
    <div>
      <h1>Configuration</h1>
      <pre>{JSON.stringify(config, null, 2)}</pre>
    </div>
  );
}
```

### Express.js Middleware

```typescript
import express from 'express';
import { ConfigHubClient } from '@confighub/sdk';

const app = express();

const configClient = new ConfigHubClient({
  baseUrl: process.env.CONFIGHUB_URL!,
  apiKey: process.env.CONFIGHUB_API_KEY!,
});

// Add config to request
app.use(async (req, res, next) => {
  try {
    req.config = await configClient.getConfigurations('my-app', 'production');
    next();
  } catch (error) {
    next(error);
  }
});

// Use in routes
app.get('/api/data', async (req, res) => {
  const apiKey = req.config['external.api.key'];
  // Use the configuration
  res.json({ success: true });
});

// Type augmentation for Express Request
declare global {
  namespace Express {
    interface Request {
      config: Record<string, any>;
    }
  }
}
```

---

## 🧪 Testing

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { ConfigHubClient } from '../src/client';

describe('ConfigHubClient', () => {
  let client: ConfigHubClient;

  beforeEach(() => {
    client = new ConfigHubClient({
      baseUrl: 'http://localhost:8080',
      apiKey: 'test-api-key',
      cacheEnabled: false,
    });
  });

  it('should fetch configurations', async () => {
    const configs = await client.getConfigurations('test-app', 'dev');
    expect(configs).toBeDefined();
    expect(typeof configs).toBe('object');
  });

  it('should get specific config', async () => {
    const value = await client.getConfig('test-app', 'dev', 'test.key');
    expect(value).toBeDefined();
  });

  it('should cache configurations', async () => {
    const clientWithCache = new ConfigHubClient({
      baseUrl: 'http://localhost:8080',
      apiKey: 'test-api-key',
      cacheEnabled: true,
    });

    await clientWithCache.getConfigurations('test-app', 'dev');
    const stats = clientWithCache.getCacheStats();
    expect(stats?.size).toBeGreaterThan(0);
  });
});
```

---

## 📦 Publishing to NPM

```bash
# Login to NPM
npm login

# Publish
npm publish --access public

# Publish with tag
npm publish --tag beta
```

---

## 🚀 Installation

```bash
# NPM
npm install @confighub/sdk

# Yarn
yarn add @confighub/sdk

# PNPM
pnpm add @confighub/sdk
```

**Continuar para:** 05-CLIENT-FLUTTER.md
