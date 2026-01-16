# @devkit/sdk

TypeScript client library for DevKit - Configuration Management & Feature Flags Platform.

## Installation

```bash
npm install @devkit/sdk
# or
yarn add @devkit/sdk
# or
pnpm add @devkit/sdk
```

## Quick Start

```typescript
import { DevKitClient } from '@devkit/sdk';

// Create client
const client = new DevKitClient({
  apiKey: 'dk_prod_3x7...9k2'
});

// Feature Flags
const enabled = await client.isFeatureEnabled('new-checkout-flow', 'user-123');
if (enabled) {
  // Show new checkout
} else {
  // Show old checkout
}

// Configurations
const apiKey = await client.getConfig('prod', 'stripe.api.key');
const timeout = await client.getConfig('prod', 'request.timeout', 'number');

// Secrets
const dbPassword = await client.getSecret('my-app', 'prod', 'database.password');
```

## Features

- ✅ Feature Flags with targeting rules
- ✅ Dynamic Configuration with caching
- ✅ Secrets Management (encrypted at rest)
- ✅ Type-safe configuration retrieval
- ✅ Automatic cache invalidation
- ✅ TypeScript support with full types
- ✅ Error handling and fallbacks

## API Documentation

### Feature Flags

```typescript
// Simple boolean check
const enabled = await client.isFeatureEnabled(flagKey, userId);

// With attributes
const enabled = await client.isFeatureEnabledWithAttributes(
  flagKey,
  userId,
  { plan: 'premium', country: 'BR' }
);

// Get evaluation with variant
const evaluation = await client.evaluateFeatureFlag(flagKey, userId);
if (evaluation.variantKey) {
  // User is in variant
}
```

### Configurations

```typescript
// Get string value
const value = await client.getConfig(environmentId, key);

// Get with type conversion
const port = await client.getConfig(environmentId, 'server.port', 'number');
const rate = await client.getConfig(environmentId, 'api.rate', 'number');
const debug = await client.getConfig(environmentId, 'debug.mode', 'boolean');

// Get all configs as map
const configs = await client.getConfigMap(environmentId);
```

### Secrets

```typescript
// Get decrypted secret
const password = await client.getSecret(applicationId, environmentId, key);

// Get all secrets as map
const secrets = await client.getSecretMap(applicationId, environmentId);
```

### Cache Management

```typescript
// Invalidate specific key
client.invalidateCache('config:prod:api.key');

// Clear all cache
client.clearCache();

// Get cache size
const size = client.getCacheSize();
```

## Configuration Options

```typescript
const client = new DevKitClient({
  apiKey: 'your-api-key',                    // Required
  baseUrl: 'https://api.usedevkit.com',     // Optional, default: http://localhost:8080
  timeout: 15000,                            // Optional, default: 10000ms
  cacheExpireAfter: 120000,                  // Optional, default: 60000ms (1 min)
  enableCache: true                          // Optional, default: true
});
```

## Error Handling

```typescript
import { DevKitError, AuthenticationError } from '@devkit/sdk';

try {
  const enabled = await client.isFeatureEnabled('flag-key', 'user-id');
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error('Authentication failed:', error.message);
  } else if (error instanceof DevKitError) {
    console.error('DevKit error:', error.message);
  }
}
```

## TypeScript Support

This package is written in TypeScript and exports full type definitions:

```typescript
import {
  DevKitClient,
  Configuration,
  Secret,
  FeatureFlag,
  FeatureFlagEvaluation,
  DevKitError,
  AuthenticationError
} from '@devkit/sdk';
```

## Requirements

- Node.js 18+ or browser with ES2020 support
- TypeScript 5.0+ (optional)

## License

MIT License - see LICENSE file for details.
