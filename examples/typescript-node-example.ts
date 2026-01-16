import { DevKitClient } from '@devkit/sdk';

/**
 * Complete example of DevKit TypeScript SDK usage in Node.js
 * Demonstrates feature flags, dynamic configuration, and secrets management
 */

async function main() {
  // Initialize the client
  const client = new DevKitClient({
    apiKey: 'your-api-key-here',
    baseUrl: 'http://localhost:8080',
    enableCache: true,
    cacheExpireAfter: 60000, // 1 minute
  });

  console.log('🚀 DevKit TypeScript SDK - Node.js Example\n');

  // ==================== FEATURE FLAGS ====================
  console.log('📌 FEATURE FLAGS');
  console.log('==================\n');

  // Simple feature flag check
  const newCheckoutEnabled = await client.isFeatureEnabled('new-checkout-flow', 'user-123');
  console.log(`New Checkout Flow: ${newCheckoutEnabled ? '✅ ENABLED' : '❌ DISABLED'}`);

  // Feature flag with custom attributes
  const premiumFeatures = await client.isFeatureEnabledWithAttributes(
    'premium-features',
    'user-456',
    {
      plan: 'premium',
      region: 'us-east-1',
      accountAge: 365,
    }
  );
  console.log(`Premium Features: ${premiumFeatures ? '✅ ENABLED' : '❌ DISABLED'}`);

  // Get detailed evaluation
  const evaluation = await client.evaluateFeatureFlag('dark-mode', 'user-789', {
    platform: 'web',
  });
  console.log(`Dark Mode Evaluation:`, {
    enabled: evaluation.enabled,
    variant: evaluation.variantKey || 'default',
    reason: evaluation.reason,
  });

  // ==================== CONFIGURATION ====================
  console.log('\n⚙️  DYNAMIC CONFIGURATION');
  console.log('========================\n');

  // Get single config value
  const apiTimeout = await client.getConfig<number>('production', 'api.timeout');
  console.log(`API Timeout: ${apiTimeout}ms`);

  // Get typed config
  const debugMode = await client.getConfig<boolean>('production', 'debug.mode', 'boolean');
  console.log(`Debug Mode: ${debugMode ? '🟢 ON' : '🔴 OFF'}`);

  const maxConnections = await client.getConfig<number>('production', 'db.max.connections', 'number');
  console.log(`Max DB Connections: ${maxConnections}`);

  // Get all configs as map
  console.log('\n📋 All Configurations:');
  const allConfigs = await client.getConfigMap('production');
  Object.entries(allConfigs).forEach(([key, value]) => {
    console.log(`  ${key}: ${value}`);
  });

  // ==================== SECRETS ====================
  console.log('\n🔐 SECRETS MANAGEMENT');
  console.log('=====================\n');

  // Get single secret
  const dbPassword = await client.getSecret('payment-service', 'production', 'database.password');
  console.log(`Database Password: ${dbPassword.substring(0, 10)}...`);

  // Get API key
  const stripeKey = await client.getSecret('payment-service', 'production', 'stripe.api.key');
  console.log(`Stripe Key: ${stripeKey.substring(0, 15)}...`);

  // Get all secrets as map
  console.log('\n🔑 All Secrets (masked):');
  const allSecrets = await client.getSecretMap('payment-service', 'production');
  Object.entries(allSecrets).forEach(([key, value]) => {
    const masked = value.length > 10
      ? value.substring(0, 4) + '...' + value.substring(value.length - 4)
      : '****';
    console.log(`  ${key}: ${masked}`);
  });

  // ==================== CACHE MANAGEMENT ====================
  console.log('\n💾 CACHE MANAGEMENT');
  console.log('==================\n');

  console.log(`Cache entries: ${client.getCacheSize()}`);

  // Invalidate specific cache entry
  client.invalidateCache('flag:new-checkout-flow:user-123');
  console.log('Invalidated specific flag cache');

  // Clear all cache
  // client.clearCache();
  // console.log('Cleared all cache');

  // ==================== ERROR HANDLING ====================
  console.log('\n⚠️  ERROR HANDLING');
  console.log('==================\n');

  try {
    // This will fail if the config doesn't exist
    const missingConfig = await client.getConfig('production', 'nonexistent.key');
    console.log(`Missing config: ${missingConfig}`);
  } catch (error: any) {
    if (error.name === 'NotFoundError') {
      console.log('✅ Handled: Configuration not found');
    } else {
      console.error('❌ Error:', error.message);
    }
  }

  try {
    // This will fail if the feature flag doesn't exist
    await client.isFeatureEnabled('nonexistent-flag', 'user-123');
  } catch (error: any) {
    if (error.name === 'NotFoundError') {
      console.log('✅ Handled: Feature flag not found');
    } else {
      console.error('❌ Error:', error.message);
    }
  }

  // ==================== REAL-WORLD USE CASES ====================
  console.log('\n🎯 REAL-WORLD USE CASES');
  console.log('=======================\n');

  // Use Case 1: A/B Testing
  console.log('1️⃣  A/B Testing - Checkout Flow');
  const abTestVariant = await client.evaluateFeatureFlag('checkout.variant', 'user-999', {
    segment: 'experimental',
  });
  const checkoutVersion = abTestVariant.variantKey || 'control';
  console.log(`   User sees: ${checkoutVersion} checkout`);

  // Use Case 2: Gradual Rollout
  console.log('\n2️⃣  Gradual Feature Rollout');
  const betaFeature = await client.isFeatureEnabled('beta-dashboard', 'user-1000');
  if (betaFeature) {
    console.log('   ✅ User has access to beta dashboard');
  } else {
    console.log('   ⏳ User is on waitlist for beta dashboard');
  }

  // Use Case 3: Dynamic Rate Limiting
  console.log('\n3️⃣  Dynamic Rate Limiting');
  const rateLimit = await client.getConfig<number>('production', 'api.rate.limit', 'number');
  const requestCount = 150;
  if (requestCount > rateLimit) {
    console.log(`   ❌ Rate limit exceeded (${requestCount}/${rateLimit})`);
  } else {
    console.log(`   ✅ Within rate limit (${requestCount}/${rateLimit})`);
  }

  // Use Case 4: Environment-Specific Configuration
  console.log('\n4️⃣  Environment-Specific Config');
  const environments = ['development', 'staging', 'production'];
  for (const env of environments) {
    try {
      const logLevel = await client.getConfig(env, 'logging.level');
      console.log(`   ${env}: log level = ${logLevel}`);
    } catch (error) {
      console.log(`   ${env}: not configured`);
    }
  }

  console.log('\n✨ Example completed successfully!');
}

// Run the example
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
