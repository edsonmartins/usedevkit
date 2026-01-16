# Feature Flags MVP - Documentation

## Overview

The Feature Flags MVP provides a complete feature flag management system that allows you to toggle features without redeploying your applications. You can rollout features to a percentage of users, target specific segments, and perform A/B testing.

## Features

### Core Capabilities

- ✅ **Simple Toggle**: Enable/disable features instantly
- ✅ **Percentage Rollout**: Gradually rollout to a percentage of users
- ✅ **User Segments**: Target specific user segments (future)
- ✅ **Gradual Rollout**: Automatically increase rollout percentage (future)
- ✅ **Targeting Rules**: Custom JSON-based targeting rules (future)
- ✅ **A/B Testing**: Test multiple variants with different payloads
- ✅ **SDK Integration**: Java SDK with caching support
- ✅ **Real-time Updates**: Immediate propagation of flag changes

### Rollout Strategies

| Strategy | Description | Use Case |
|----------|-------------|----------|
| `ALL` | Feature enabled for all users | Complete rollout |
| `PERCENTAGE` | Enabled for X% of users | Gradual rollout, testing |
| `USER_SEGMENT` | Target specific segments | Beta users, premium customers |
| `GRADUAL` | Auto-increasing percentage | Automated rollout |
| `TARGETING_RULES` | Custom JSON rules | Complex conditions |

## Architecture

### Backend (Spring Boot)

```
src/main/java/com/devkit/featureFlags/
├── domain/
│   ├── FeatureFlagEntity.java              # JPA Entity with domain logic
│   ├── FeatureFlagVariantEntity.java       # A/B testing variants
│   ├── FeatureFlagRepository.java          # Spring Data JPA repository
│   ├── FeatureFlagCommandService.java      # Write operations (CQRS)
│   ├── FeatureFlagQueryService.java        # Read operations (CQRS)
│   ├── FeatureFlagMapper.java              # Entity ↔ DTO mapping
│   ├── CreateFeatureFlagCmd.java           # Create command
│   ├── UpdateFeatureFlagCmd.java           # Update command
│   ├── FeatureFlagResult.java              # Query result DTO
│   ├── vo/
│   │   └── FeatureFlagId.java              # Value object
│   └── events/
│       ├── FeatureFlagCreatedEvent.java
│       ├── FeatureFlagUpdatedEvent.java
│       ├── FeatureFlagEnabledEvent.java
│       ├── FeatureFlagDisabledEvent.java
│       └── FeatureFlagDeletedEvent.java
└── rest/
    ├── FeatureFlagController.java          # Management REST API
    ├── FeatureFlagEvaluationController.java # SDK Evaluation API
    ├── CreateFeatureFlagRequest.java       # Create DTO
    ├── UpdateFeatureFlagRequest.java       # Update DTO
    └── FeatureFlagResponse.java            # Response DTO
```

### Database Schema

```sql
-- Feature Flags Table
CREATE TABLE feature_flags (
    id VARCHAR(255) PRIMARY KEY,
    key VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL,              -- ENABLED, DISABLED, CONDITIONAL
    rollout_strategy VARCHAR(30) NOT NULL,    -- ALL, PERCENTAGE, USER_SEGMENT, GRADUAL, TARGETING_RULES
    rollout_percentage INTEGER,
    targeting_rules TEXT,                     -- JSON string
    application_id VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    version INTEGER,
    UNIQUE (application_id, key)
);

-- Feature Flag Variants (A/B Testing)
CREATE TABLE feature_flag_variants (
    id VARCHAR(255) PRIMARY KEY,
    key VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    rollout_percentage INTEGER NOT NULL,
    payload TEXT,                             -- JSON configuration for this variant
    is_control BOOLEAN DEFAULT FALSE,
    feature_flag_id VARCHAR(255) NOT NULL,
    FOREIGN KEY (feature_flag_id) REFERENCES feature_flags(id)
);
```

### Frontend (Next.js)

```
src/
├── app/feature-flags/
│   └── page.tsx                             # Feature flags management page
├── components/feature-flags/
│   ├── FeatureFlagCard.tsx                  # Display individual flag
│   ├── FeatureFlagDialog.tsx                # Create/Edit dialog
│   └── DeleteFeatureFlagDialog.tsx          # Delete confirmation
├── stores/
│   └── useFeatureFlagStore.ts               # Zustand state management
├── lib/api/
│   └── featureFlags.ts                      # API client
└── types/
    └── featureFlag.ts                       # TypeScript types
```

## REST API

### Management API

#### Create Feature Flag
```http
POST /api/v1/feature-flags
Content-Type: application/json

{
  "applicationId": "app-123",
  "key": "new_checkout_flow",
  "name": "New Checkout Flow",
  "description": "Testing new checkout experience",
  "status": "CONDITIONAL",
  "rolloutStrategy": "PERCENTAGE",
  "rolloutPercentage": 25,
  "targetingRules": null
}
```

#### List Feature Flags by Application
```http
GET /api/v1/feature-flags/application/{applicationId}
```

#### Get Feature Flag by ID
```http
GET /api/v1/feature-flags/{flagId}
```

#### Update Feature Flag
```http
PUT /api/v1/feature-flags/{flagId}
Content-Type: application/json

{
  "name": "Updated Name",
  "description": "Updated description",
  "status": "ENABLED",
  "rolloutPercentage": 50
}
```

#### Enable Feature Flag
```http
POST /api/v1/feature-flags/{flagId}/enable
```

#### Disable Feature Flag
```http
POST /api/v1/feature-flags/{flagId}/disable
```

#### Delete Feature Flag
```http
DELETE /api/v1/feature-flags/{flagId}
```

### SDK Evaluation API

#### Evaluate Single Flag
```http
GET /api/v1/feature-flags/evaluate/{key}?userId=user123&context={"country":"US"}

Response:
{
  "key": "new_checkout_flow",
  "enabled": true,
  "variant": "variant_a",
  "rolloutPercentage": 25,
  "payload": "{\"color\":\"blue\"}"
}
```

#### Batch Evaluation
```http
POST /api/v1/feature-flags/evaluate-batch
Content-Type: application/json

{
  "keys": ["flag1", "flag2", "flag3"],
  "userId": "user123",
  "context": {"tier": "premium"}
}

Response:
{
  "flag1": {"key": "flag1", "enabled": true, ...},
  "flag2": {"key": "flag2", "enabled": false, ...},
  "flag3": {"key": "flag3", "enabled": true, ...}
}
```

#### Get All Flags (SDK)
```http
GET /api/v1/feature-flags/application/{applicationId}/all-flags

Response:
{
  "flags": {
    "flag1": {"key": "flag1", "status": "ENABLED", ...},
    "flag2": {"key": "flag2", "status": "CONDITIONAL", ...}
  }
}
```

## SDK Usage

### Java SDK

#### Installation (Maven)

```xml
<dependency>
    <groupId>com.devkit</groupId>
    <artifactId>devkit-sdk</artifactId>
    <version>1.0.0</version>
</dependency>
```

#### Initialization

```java
import com.devkit.sdk.DevKitClient;
import com.devkit.sdk.DevKitClientBuilder;

DevKitClient client = new DevKitClientBuilder()
    .baseUrl("https://api.usedevkit.com")
    .apiKey("your-api-key")
    .cacheEnabled(true)
    .cacheExpireMs(60000)  // 1 minute
    .build();
```

#### Check if Feature is Enabled

```java
// Simple boolean check
boolean enabled = client.isFeatureEnabled("new_checkout_flow", "user123");

if (enabled) {
    // Show new feature
} else {
    // Show old feature
}
```

#### Get Feature with Variant

```java
import com.devkit.sdk.model.FeatureFlagEvaluation;

FeatureFlagEvaluation evaluation = client.evaluateFeatureFlag("new_checkout_flow", "user123");

if (evaluation.enabled()) {
    String variant = evaluation.variant();
    String payload = evaluation.payload();

    // Use variant and payload
    if ("variant_a".equals(variant)) {
        // Show variant A
    } else {
        // Show variant B
    }
}
```

#### Advanced Evaluation with Attributes

```java
Map<String, Object> attributes = Map.of(
    "country", "US",
    "tier", "premium",
    "age", 25
);

boolean enabled = client.isFeatureEnabled(
    "premium_features",
    "user123",
    attributes
);
```

#### Cache Management

```java
// Invalidate specific cache entry
client.invalidateCache("flag:user123");

// Clear all cache
client.clearCache();

// Get cache size
long size = client.getCacheSize();
```

## Web Interface

### Creating a Feature Flag

1. Navigate to **Feature Flags** in the sidebar
2. Select an application from the dropdown
3. Click **New Feature Flag**
4. Fill in the form:
   - **Key**: Unique identifier (e.g., `new_checkout_flow`)
   - **Name**: Display name (e.g., "New Checkout Flow")
   - **Description**: What this flag controls
   - **Status**: Disabled, Enabled, or Conditional
   - **Rollout Strategy**: How to rollout the feature
   - **Rollout Percentage**: For percentage-based strategies (0-100)
   - **Targeting Rules**: JSON string for custom rules
5. Click **Create**

### Editing a Feature Flag

1. Find the flag in the list
2. Click the **three-dot menu** (⋮)
3. Select **Edit**
4. Modify the fields
5. Click **Save Changes**

### Enabling/Disabling

Use the toggle switch on the flag card to quickly enable/disable flags.

### Deleting a Feature Flag

1. Click the **three-dot menu** (⋮)
2. Select **Delete**
3. Type the flag name to confirm
4. Click **Delete Feature Flag**

## Use Cases

### 1. Gradual Rollout

Rollout a new feature to 25% of users:

```json
{
  "key": "new_search_algorithm",
  "status": "CONDITIONAL",
  "rolloutStrategy": "PERCENTAGE",
  "rolloutPercentage": 25
}
```

Gradually increase to 50%, 75%, then 100%.

### 2. A/B Testing

Test two different checkout flows:

1. Create flag with `PERCENTAGE` strategy
2. Add variants:
   - `control`: 50% rollout, old checkout
   - `variant_a`: 50% rollout, new checkout

```java
FeatureFlagEvaluation eval = client.evaluateFeatureFlag("checkout_flow", userId);
String variant = eval.variant();

if ("variant_a".equals(variant)) {
    // Show new checkout
} else {
    // Show control checkout
}
```

### 3. Beta Testing

Enable feature only for beta users:

```json
{
  "key": "beta_features",
  "status": "CONDITIONAL",
  "rolloutStrategy": "TARGETING_RULES",
  "targetingRules": "{\"user_group\": \"beta\"}"
}
```

### 4. Kill Switch

Quickly disable a buggy feature:

```java
if (client.isFeatureEnabled("experimental_feature", userId)) {
    try {
        // Feature code
    } catch (Exception e) {
        // Report error
    }
}
```

Then disable the flag from the web interface.

## Best Practices

### Key Naming

- Use **snake_case**: `new_checkout_flow`, `dark_mode_enabled`
- Be **descriptive**: `show_new_pricing` instead of `flag1`
- Use **prefixes** for grouping: `checkout_`, `search_`, `ui_`

### Rollout Strategy

- Start with **PERCENTAGE** at 10-25%
- Monitor metrics and errors
- Gradually increase to 100%
- Keep **kill switch** ready at all times

### Testing

```java
// Always test flag existence
if (client.isFeatureEnabled("my_feature", userId)) {
    // Feature code
} else {
    // Default/fallback behavior
}
```

### Performance

- Enable **SDK cache** (default: 1 minute)
- Use **batch evaluation** for multiple flags
- Set appropriate **cache expiration** based on use case

### Cleanup

- Remove unused flags after feature is fully rolled out
- Archive flags that might be needed later
- Keep flag descriptions updated

## Troubleshooting

### Flag Not Working

1. Check flag status is `ENABLED` or `CONDITIONAL`
2. Verify `rolloutPercentage` is greater than 0
3. Check `applicationId` matches your SDK configuration
4. Verify API key is valid
5. Check SDK cache (try clearing it)

### Cache Issues

```java
// Clear cache to force refresh
client.clearCache();
```

### Evaluation Not Consistent

- Percentage-based uses **user ID hash** for consistency
- Same user will always see the same variant
- Different users get different variants based on hash

## Status

✅ **MVP Complete** - Sprint 1-2

- ✅ Backend API (Management + Evaluation)
- ✅ Database schema with variants
- ✅ Web UI (List, Create, Edit, Delete)
- ✅ Java SDK with caching
- ✅ Documentation

## Next Steps

- [ ] Add user segment targeting
- [ ] Implement gradual automatic rollout
- [ ] Add targeting rules editor (JSON editor)
- [ ] TypeScript SDK (Node.js + Browser)
- [ ] Flutter SDK
- [ ] Audit logs for flag changes
- [ ] Flag versioning and rollback

## Support

- **Issues**: GitHub Issues
- **Documentation**: `/docs`
- **API Reference**: Swagger UI at `/swagger-ui.html`
