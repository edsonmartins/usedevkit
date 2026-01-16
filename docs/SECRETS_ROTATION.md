# Secrets Rotation - Complete Guide

## Overview

Secrets Rotation allows you to automatically rotate sensitive credentials (API keys, database passwords, tokens) on a scheduled basis without manual intervention. This security best practice reduces the risk of credential leakage and limits the potential damage from compromised secrets.

**Key Feature**: Rotate database password with 1 click! 🔄

## Features

### Core Capabilities

- ✅ **Manual Rotation**: Rotate any secret with a single click from the UI
- ✅ **Automatic Rotation**: Schedule automatic rotation (30/60/90 days)
- ✅ **Rotation History**: Complete audit trail of all rotations with before/after values
- ✅ **Expiration Warnings**: Visual alerts for secrets expiring soon (within 7 days)
- ✅ **Validation API**: Check which secrets need rotation
- ✅ **Scheduler Service**: Automatic background rotation with logging
- ✅ **Encryption**: AES-256-GCM encryption for all secrets at rest

## Architecture

### Backend Components

```
src/main/java/com/devkit/secrets/
├── domain/
│   ├── SecretEntity.java                      # Main secret with rotation fields
│   ├── SecretRotationEntity.java              # Rotation history ⭐ NEW
│   ├── SecretRepository.java
│   ├── SecretRotationRepository.java          # History repository ⭐ NEW
│   ├── SecretCommandService.java              # Updated with history
│   ├── SecretRotationScheduler.java           # Auto-rotation service ⭐ NEW
│   └── events/
│       └── SecretRotatedEvent.java            # Domain event
└── rest/
    ├── SecretController.java                  # CRUD + rotate endpoint
    └── SecretRotationController.java          # History & validation APIs ⭐ NEW
```

### Frontend Components

```
src/app/secrets/
└── page.tsx                                   # Secrets management page ⭐ NEW
    - Secret cards with status badges
    - Expiration warnings
    - "Rotate Now" button with confirmation
    - Rotation history display
```

## REST API

### 1. Manual Rotation

#### Rotate a Secret

```http
POST /api/v1/secrets/{id}/rotate
Content-Type: application/json

{
  "newEncryptedValue": "encrypted_new_password_here",
  "rotatedBy": "admin@example.com"
}
```

**Response:**
```json
{
  "id": "secret-123",
  "key": "database.password",
  "versionNumber": 3,
  "lastRotationDate": "2024-01-15T10:30:00Z",
  "nextRotationDate": "2024-04-15T10:30:00Z"
}
```

### 2. Rotation History

#### Get Rotation History for a Secret

```http
GET /api/v1/secrets/{secretId}/rotations
```

**Response:**
```json
[
  {
    "id": "rotation-456",
    "secretId": "secret-123",
    "secretKey": "database.password",
    "previousVersion": 2,
    "newVersion": 3,
    "rotatedBy": "admin@example.com",
    "status": "SUCCESS",
    "reason": "MANUAL",
    "rotationDate": "2024-01-15T10:30:00Z"
  },
  {
    "id": "rotation-789",
    "secretId": "secret-123",
    "secretKey": "database.password",
    "previousVersion": 1,
    "newVersion": 2,
    "rotatedBy": "SYSTEM_SCHEDULER",
    "status": "SUCCESS",
    "reason": "AUTOMATIC_SCHEDULED",
    "rotationDate": "2023-12-15T10:30:00Z"
  }
]
```

#### Get Application Rotation History

```http
GET /api/v1/secrets/application/{applicationId}/rotations
```

#### Get Recent Rotations

```http
GET /api/v1/secrets/rotations/recent?days=7
```

### 3. Validation & Monitoring

#### Validate Secrets for Rotation

```http
GET /api/v1/secrets/validate?applicationId=app-123
```

**Response:**
```json
{
  "needsRotation": [
    {
      "id": "secret-123",
      "key": "database.password",
      "applicationId": "app-123",
      "environmentId": "production",
      "nextRotationDate": "2024-01-10T10:30:00Z"
    }
  ],
  "expiringSoon": [
    {
      "id": "secret-456",
      "key": "api.key",
      "applicationId": "app-123",
      "environmentId": "production",
      "nextRotationDate": "2024-01-20T10:30:00Z"
    }
  ],
  "details": {
    "totalSecrets": 10,
    "activeSecrets": 8,
    "needsRotation": 1,
    "expiringSoon": 1
  }
}
```

#### Get Rotation Statistics

```http
GET /api/v1/secrets/stats?applicationId=app-123
```

**Response:**
```json
{
  "totalRotations": 45,
  "successfulRotations": 43,
  "failedRotations": 2,
  "manualRotations": 30,
  "automaticRotations": 15,
  "successRate": 95.56
}
```

### 4. Automatic Rotation

#### Trigger Automatic Rotation (Manual)

```http
POST /api/v1/secrets/rotate-due?applicationId=app-123
```

**Response:**
```json
{
  "message": "Automatic rotation triggered",
  "rotatedCount": 3,
  "timestamp": "2024-01-15T11:00:00Z"
}
```

## Web Interface

### Secrets Management Page

Navigate to **/secrets** to access the secrets management interface.

#### Features:

1. **Secret Cards**
   - Display secret key, description, application, environment
   - Active/Inactive status badges
   - Rotation policy display (Manual, 30/60/90 days)
   - Current version number
   - Last rotation date
   - Next rotation date (with color-coded warnings)

2. **Expiration Warnings**
   - 🔴 **Red**: Secrets past rotation date ("Needs Rotation")
   - 🟡 **Yellow**: Secrets expiring within 7 days ("Expiring Soon")
   - Alerts displayed at top of page with counts

3. **Rotate Now Button**
   - One-click rotation for any secret
   - Confirmation dialog with details
   - Shows version change (e.g., v2 → v3)
   - Loading state during rotation
   - Success feedback

4. **Rotation History**
   - Click "History" button to view all rotations
   - Shows version progression (v1 → v2 → v3)
   - Rotated by user/system
   - Rotation reason (Manual, Automatic)
   - Timestamp

## Automatic Rotation Scheduler

### Setup

The `SecretRotationScheduler` service runs automatically to rotate secrets based on their rotation policy.

#### Rotation Policies

```java
public enum RotationPolicy {
    MANUAL,                  // No automatic rotation
    AUTOMATIC_30_DAYS,       // Rotate every 30 days
    AUTOMATIC_60_DAYS,       // Rotate every 60 days
    AUTOMATIC_90_DAYS        // Rotate every 90 days
}
```

#### Integration with External Schedulers

**Option 1: Cron Job (Recommended)**

```bash
# Run daily at 2 AM
0 2 * * * curl -X POST http://localhost:8080/api/v1/secrets/rotate-due
```

**Option 2: Spring @Scheduled (Future)**

```java
@Scheduled(cron = "0 0 2 * * ?")
public void scheduledRotation() {
    rotationScheduler.rotateDueSecrets();
}
```

**Option 3: Kubernetes CronJob**

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: secret-rotation
spec:
  schedule: "0 2 * * *"
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: rotation
            image: your-app:latest
            command: ["curl", "-X", "POST", "http://localhost:8080/api/v1/secrets/rotate-due"]
```

## Real-World Use Cases

### Use Case 1: Database Password Rotation

**Problem:** Database password compromised, need to rotate immediately without downtime.

**Solution:**

1. **Initial Setup:**
```json
{
  "key": "database.password",
  "encryptedValue": "old_encrypted_password",
  "rotationPolicy": "MANUAL",
  "applicationId": "payment-service"
}
```

2. **Rotate from UI:**
   - Go to `/secrets`
   - Find "database.password"
   - Click "Rotate Now"
   - Confirm rotation
   - New password generated automatically

3. **Update Application:**
```java
// SDK fetches new password automatically
String dbPassword = client.getSecret("payment-service", "database.password");

// Or use hot reload for instant update
hotReload.start(secrets -> {
    String newDbPassword = secrets.get("database.password");
    updateDatabaseConnection(newDbPassword);
});
```

4. **Result:**
   - Password changed in 1 click ✅
   - Old password preserved in history
   - Version incremented (v2 → v3)
   - No application restart needed

### Use Case 2: API Key Auto-Rotation

**Problem:** External API requires key rotation every 90 days for compliance.

**Solution:**

1. **Create Secret with Auto-Rotation:**
```json
{
  "key": "stripe.api.key",
  "encryptedValue": "sk_test_...",
  "rotationPolicy": "AUTOMATIC_90_DAYS",
  "applicationId": "billing-service"
}
```

2. **Setup Scheduler:**
```bash
# Cron job runs daily
0 2 * * * curl -X POST http://confighub/api/v1/secrets/rotate-due?applicationId=billing-service
```

3. **Automatic Process:**
   - Scheduler checks secret daily
   - 90 days after creation → auto-rotates
   - Generates new 32-character secure string
   - Records rotation in history
   - Emits `SecretRotatedEvent`

4. **Application Integration:**
```java
// Listen for rotation events
@EventListener
public void onSecretRotated(SecretRotatedEvent event) {
    if (event.key().equals("stripe.api.key")) {
        // Update Stripe client with new key
        stripeClient.updateApiKey(getNewSecretValue());
    }
}
```

### Use Case 3: Security Incident Response

**Problem:** Secret leaked in GitHub repo, need immediate rotation.

**Solution:**

1. **Emergency Rotation:**
   - Go to `/secrets`
   - Identify leaked secrets (validation API shows "Needs Rotation")
   - Click "Rotate Now" for each leaked secret
   - All rotated in under 1 minute

2. **Audit Trail:**
```bash
GET /api/v1/secrets/rotations/failed
# Check for any rotation failures

GET /api/v1/secrets/stats
# Verify all rotations successful
```

3. **Post-Incident:**
   - Review rotation history
   - Change rotation policy to 30 days (increased security)
   - Enable auto-rotation for all secrets
   - Update documentation

## Security Best Practices

### 1. Rotation Policies

**Manual Rotation:**
- Use for: Secrets that rarely change, require manual coordination
- Examples: External API keys with strict change processes, third-party credentials

**Automatic Rotation (30/60/90 days):**
- Use for: High-frequency secrets, automated systems
- Examples: Database passwords, internal API keys, service tokens

### 2. Password Generation

The system generates secure 32-character passwords by default:

```java
// Default: 32 characters with special symbols
String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
```

**Custom Generation:**
```java
// For external secret managers
private String generateNewSecretValue(SecretEntity secret) {
    // Integrate with AWS Secrets Manager
    return awsSecretsManager.generateRandomPassword(32);

    // Or HashiCorp Vault
    return vault.generateLogicalSecret(secret.getKey());
}
```

### 3. Encryption

All secrets are encrypted at rest using AES-256-GCM:

- ✅ Encryption before storage
- ✅ Decryption only in memory
- ✅ No plaintext in logs
- ✅ Version history preserves encrypted values only

### 4. Access Control

**Recommended:**
- Restrict `/secrets` page to admins only
- Require 2FA for manual rotation
- Audit log all rotations with user identity
- Set up alerts for failed rotations

## Monitoring & Alerts

### Key Metrics

Monitor these metrics to ensure rotation health:

```bash
# Check for secrets needing rotation
GET /api/v1/secrets/validate

# Check recent failures
GET /api/v1/secrets/rotations/failed

# Get statistics
GET /api/v1/secrets/stats
```

### Alerting Setup

**Prometheus/Grafana:**

```yaml
# Alert on secrets needing rotation
- alert: SecretsNeedingRotation
  expr: secrets_needing_rotation > 0
  for: 1h
  annotations:
    summary: "{{ $value }} secrets need rotation"

# Alert on rotation failures
- alert: RotationFailures
  expr: rate(rotation_failures[1h]) > 0
  annotations:
    summary: "Secret rotation failing"
```

**Slack Integration:**

```java
@EventListener
public void onRotationFailed(SecretRotationEvent event) {
    if (event.getStatus() == RotationStatus.FAILED) {
        slackClient.send(
            ":warning: Secret rotation failed for " + event.getSecretKey() +
            "\nError: " + event.getErrorMessage()
        );
    }
}
```

## Troubleshooting

### Rotation Not Working

1. **Check rotation policy:**
```bash
GET /api/v1/secrets/{id}
# Verify rotationPolicy is not MANUAL
```

2. **Check next rotation date:**
```bash
GET /api/v1/secrets/validate
# See if secret appears in needsRotation
```

3. **Check scheduler logs:**
```bash
tail -f logs/application.log | grep "SecretRotationScheduler"
```

### Rotation Fails

1. **View failed rotations:**
```bash
GET /api/v1/secrets/rotations/failed
```

2. **Check error messages in rotation history**

3. **Common issues:**
   - External secret manager unavailable
   - Network connectivity issues
   - Insufficient permissions

### Application Not Getting Updated Values

1. **Verify SDK polling:**
```java
hotReload.isRunning() // Should be true
hotReload.getLastUpdate() // Check recent
```

2. **Check cache TTL:**
```java
// Reduce cache TTL for faster updates
.cacheExpireAfter(5000) // 5 seconds
```

3. **Force refresh:**
```java
hotReload.refresh(); // Manual refresh
```

## Performance Considerations

### Backend

- **Encryption**: AES-256-GCM is fast (~500MB/s)
- **History Queries**: Indexed on `secret_id` and `rotation_date`
- **Validation**: O(n) where n = total secrets

### Frontend

- **Initial Load**: Fetches all secrets + validation data
- **History**: Lazy-loaded on demand
- **Polling**: No polling - uses manual refresh

### Recommendations

- **< 100 secrets**: No performance issues
- **100-1000 secrets**: Consider pagination
- **> 1000 secrets**: Add pagination, filter by application

## Migration Guide

### From Manual Secrets Management

**Before:** Plain text in environment variables or config files

```bash
# .env file
DATABASE_PASSWORD=supersecretpassword123
API_KEY=sk_live_abc123
```

**After:** Encrypted secrets with automatic rotation

```java
// Create secret via API
POST /api/v1/secrets
{
  "key": "database.password",
  "encryptedValue": EncryptionService.encrypt("supersecretpassword123"),
  "rotationPolicy": "AUTOMATIC_90_DAYS"
}

// Fetch in application
String password = client.getSecret("app-123", "database.password");
```

### Integration Steps

1. **Backend Integration:**
```java
// Add DevKit SDK dependency
implementation 'com.devkit:java-sdk:1.0.0'

// Configure client
DevKitClient client = new DevKitClientBuilder()
    .apiKey("your-api-key")
    .build();

// Fetch secrets
Map<String, String> secrets = client.getAllSecrets("app-123", "production");
String dbPassword = secrets.get("database.password");
```

2. **Frontend Integration:**
```typescript
// Use React Context or Zustand for secret state
const { secrets } = useSecrets();

// Display in UI
<SecretCard secret={secrets.databasePassword} />
```

## Status

✅ **Sprint 7-8: Secrets Rotation** - COMPLETE

- ✅ Manual rotation (1-click)
- ✅ Rotation history with audit trail
- ✅ Automatic rotation scheduler
- ✅ Validation API
- ✅ Frontend UI with warnings
- ✅ Statistics and monitoring
- ✅ AES-256-GCM encryption

## Future Enhancements

1. **External Secret Manager Integration**
   - AWS Secrets Manager
   - Google Secret Manager
   - Azure Key Vault
   - HashiCorp Vault

2. **Approval Workflow**
   - Require approval for production rotations
   - Multi-party approval for critical secrets

3. **Rollback Capability**
   - Instant rollback to previous version
   - Automatic rollback on failure detection

4. **Secret Templates**
   - Pre-defined secret types (DB password, API key, etc.)
   - Validation rules per type

5. **Compliance Reporting**
   - Generate rotation compliance reports
   - Audit logs for SOC 2, ISO 27001

## Support

- **Documentation**: `/docs`
- **Examples**: `/examples/secrets`
- **Issues**: GitHub Issues
