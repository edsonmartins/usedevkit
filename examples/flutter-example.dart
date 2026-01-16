import 'package:devkit_sdk/devkit_sdk.dart';

/// Complete example of DevKit Flutter SDK usage
/// Demonstrates feature flags, dynamic configuration, and secrets management
Future<void> main() async {
  // Initialize the client
  final client = DevKitClient(
    apiKey: 'your-api-key-here',
    baseUrl: 'http://localhost:8080',
    enableCache: true,
    cacheExpireAfter: const Duration(minutes: 1),
  );

  print('🚀 DevKit Flutter SDK - Example\n');

  // ==================== FEATURE FLAGS ====================
  print('📌 FEATURE FLAGS');
  print('==================\n');

  // Simple feature flag check
  final newCheckoutEnabled =
      await client.isFeatureEnabled('new-checkout-flow', 'user-123');
  print('New Checkout Flow: ${newCheckoutEnabled ? '✅ ENABLED' : '❌ DISABLED'}');

  // Feature flag with custom attributes
  final premiumFeatures = await client.isFeatureEnabledWithAttributes(
    'premium-features',
    'user-456',
    attributes: {
      'plan': 'premium',
      'region': 'us-east-1',
      'accountAge': 365,
    },
  );
  print('Premium Features: ${premiumFeatures ? '✅ ENABLED' : '❌ DISABLED'}');

  // Get detailed evaluation
  final evaluation = await client.evaluateFeatureFlag(
    'dark-mode',
    'user-789',
    attributes: {'platform': 'mobile'},
  );
  print('Dark Mode Evaluation: '
      'enabled=${evaluation.enabled}, '
      'variant=${evaluation.variantKey ?? 'default'}, '
      'reason=${evaluation.reason}');

  // ==================== CONFIGURATION ====================
  print('\n⚙️  DYNAMIC CONFIGURATION');
  print('========================\n');

  // Get single config value
  final apiTimeout =
      await client.getConfig<int>('production', 'api.timeout', type: 'number');
  print('API Timeout: ${apiTimeout}ms');

  // Get typed config
  final debugMode =
      await client.getConfig<bool>('production', 'debug.mode', type: 'boolean');
  print('Debug Mode: ${debugMode ? '🟢 ON' : '🔴 OFF'}');

  final maxConnections = await client.getConfig<int>(
    'production',
    'db.max.connections',
    type: 'number',
  );
  print('Max DB Connections: $maxConnections');

  // Get all configs as map
  print('\n📋 All Configurations:');
  final allConfigs = await client.getConfigMap('production');
  allConfigs.forEach((key, value) {
    print('  $key: $value');
  });

  // ==================== SECRETS ====================
  print('\n🔐 SECRETS MANAGEMENT');
  print('=====================\n');

  // Get single secret
  final dbPassword = await client.getSecret(
    'payment-service',
    'production',
    'database.password',
  );
  print('Database Password: ${dbPassword.substring(0, 10)}...');

  // Get API key
  final stripeKey = await client.getSecret(
    'payment-service',
    'production',
    'stripe.api.key',
  );
  print('Stripe Key: ${stripeKey.substring(0, 15)}...');

  // Get all secrets as map
  print('\n🔑 All Secrets (masked):');
  final allSecrets = await client.getSecretMap('payment-service', 'production');
  allSecrets.forEach((key, value) {
    final masked = value.length > 10
        ? '${value.substring(0, 4)}...${value.substring(value.length - 4)}'
        : '****';
    print('  $key: $masked');
  });

  // ==================== CACHE MANAGEMENT ====================
  print('\n💾 CACHE MANAGEMENT');
  print('==================\n');

  print('Cache entries: ${client.cacheSize}');

  // Invalidate specific cache entry
  client.invalidateCache('flag:new-checkout-flow:user-123');
  print('Invalidated specific flag cache');

  // Clear all cache
  // client.clearCache();
  // print('Cleared all cache');

  // ==================== ERROR HANDLING ====================
  print('\n⚠️  ERROR HANDLING');
  print('==================\n');

  try {
    // This will fail if the config doesn't exist
    final missingConfig =
        await client.getConfig('production', 'nonexistent.key');
    print('Missing config: $missingConfig');
  } on NotFoundException catch (error) {
    print('✅ Handled: Configuration not found');
  } on DevKitException catch (error) {
    print('❌ Error: ${error.message}');
  }

  try {
    // This will fail if the feature flag doesn't exist
    await client.isFeatureEnabled('nonexistent-flag', 'user-123');
  } on NotFoundException catch (error) {
    print('✅ Handled: Feature flag not found');
  } on DevKitException catch (error) {
    print('❌ Error: ${error.message}');
  }

  // ==================== REAL-WORLD USE CASES ====================
  print('\n🎯 REAL-WORLD USE CASES');
  print('=======================\n');

  // Use Case 1: A/B Testing
  print('1️⃣  A/B Testing - Checkout Flow');
  final abTestVariant = await client.evaluateFeatureFlag(
    'checkout.variant',
    'user-999',
    attributes: {'segment': 'experimental'},
  );
  final checkoutVersion = abTestVariant.variantKey ?? 'control';
  print('   User sees: $checkoutVersion checkout');

  // Use Case 2: Gradual Rollout
  print('\n2️⃣  Gradual Feature Rollout');
  final betaFeature =
      await client.isFeatureEnabled('beta-dashboard', 'user-1000');
  if (betaFeature) {
    print('   ✅ User has access to beta dashboard');
  } else {
    print('   ⏳ User is on waitlist for beta dashboard');
  }

  // Use Case 3: Dynamic Rate Limiting
  print('\n3️⃣  Dynamic Rate Limiting');
  final rateLimit = await client.getConfig<int>(
    'production',
    'api.rate.limit',
    type: 'number',
  );
  final requestCount = 150;
  if (requestCount > rateLimit) {
    print('   ❌ Rate limit exceeded ($requestCount/$rateLimit)');
  } else {
    print('   ✅ Within rate limit ($requestCount/$rateLimit)');
  }

  // Use Case 4: UI Feature Flags in Flutter
  print('\n4️⃣  UI Feature Toggle Example');
  final showNewUI = await client.isFeatureEnabled('new-ui-design', 'user-1001');
  print('   ${showNewUI ? '🎨' : '📱'} UI: ${showNewUI ? 'New Design' : 'Classic Design'}');

  // Use Case 5: Environment-Specific Configuration
  print('\n5️⃣  Environment-Specific Config');
  final environments = ['development', 'staging', 'production'];
  for (final env in environments) {
    try {
      final logLevel = await client.getConfig(env, 'logging.level');
      print('   $env: log level = $logLevel');
    } on Exception {
      print('   $env: not configured');
    }
  }

  // ==================== FLUTTER-SPECIFIC EXAMPLES ====================
  print('\n📱 FLUTTER UI INTEGRATION');
  print('=======================\n');

  // Example: Feature-gated widget
  print('Feature-gated widget example:');
  final premiumWidgetEnabled =
      await client.isFeatureEnabled('premium-widget', 'user-1002');
  print('   Premium widget: ${premiumWidgetEnabled ? 'visible' : 'hidden'}');

  // Example: Dynamic theming
  print('\nDynamic theming example:');
  final darkModeEnabled =
      await client.isFeatureEnabled('dark-mode', 'user-1003');
  print('   Theme: ${darkModeEnabled ? 'dark' : 'light'} mode');

  // Example: Remote configuration for app behavior
  print('\nRemote configuration example:');
  final enableNotifications =
      await client.getConfig<bool>('production', 'notifications.enabled', type: 'boolean');
  print('   Notifications: ${enableNotifications ? 'enabled' : 'disabled'}');

  print('\n✨ Example completed successfully!');
}

/// Example Flutter Widget Integration
///
/// ```dart
/// class FeatureGatedWidget extends StatelessWidget {
///   final String userId;
///   final String featureKey;
///   final Widget child;
///
///   const FeatureGatedWidget({
///     required this.userId,
///     required this.featureKey,
///     required this.child,
///   });
///
///   @override
///   Widget build(BuildContext context) {
///     return FutureBuilder<bool>(
///       future: DevKitClient.instance.isFeatureEnabled(featureKey, userId),
///       builder: (context, snapshot) {
///         if (snapshot.connectionState == ConnectionState.waiting) {
///           return CircularProgressIndicator();
///         }
///
///         if (snapshot.data == true) {
///           return child;
///         }
///
///         return SizedBox.shrink();
///       },
///     );
///   }
/// }
/// ```
///
/// Example usage:
/// ```dart
/// FeatureGatedWidget(
///   userId: 'user-123',
///   featureKey: 'premium-dashboard',
///   child: PremiumDashboard(),
/// )
/// ```
