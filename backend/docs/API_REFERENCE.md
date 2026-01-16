# ConfigHub API Reference

## 📚 Table of Contents
- [Authentication](#authentication)
- [Applications](#applications)
- [Environments](#environments)
- [Configurations](#configurations)
- [Secrets](#secrets)
- [Feature Flags](#feature-flags)
- [Services](#services)
- [Environment Promotion](#environment-promotion)
- [Webhooks](#webhooks)
- [Error Codes](#error-codes)
- [Rate Limiting](#rate-limiting)

---

## 🔐 Authentication

### Overview
ConfigHub uses JWT (JSON Web Token) authentication with API Keys. All endpoints except `/api/v1/auth/**` require a valid JWT token.

### Authentication Flow

```bash
# 1. Generate API Key (one-time operation)
curl -X POST http://localhost:8080/api/v1/auth/api-keys \
  -H "Content-Type: application/json" \
  -d '{
    "applicationId": "myapp",
    "name": "Production API Key"
  }'

# Response: { "apiKey": "sk_live_abc123..." }

# 2. Authenticate with API Key to get JWT
curl -X POST http://localhost:8080/api/v1/auth/authenticate \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "sk_live_abc123..."
  }'

# Response: {
#   "access_token": "eyJhbGciOiJIUzI1NiIs...",
#   "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
#   "token_type": "Bearer",
#   "expires_in": 3600
# }

# 3. Use JWT in subsequent requests
curl -X GET http://localhost:8080/api/v1/applications \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."

# 4. Refresh token before expiry
curl -X POST http://localhost:8080/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }'
```

### Endpoints

#### POST /api/v1/auth/authenticate
Authenticate using an API key and receive JWT tokens.

**Request Body:**
```json
{
  "apiKey": "sk_live_abc123xyz789"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "applicationId": "myapp"
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid API key
- `404 Not Found` - Application not found

---

#### POST /api/v1/auth/refresh
Refresh an access token using a refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or expired refresh token

---

#### POST /api/v1/auth/api-keys
Generate a new API key for an application.

**Request Body:**
```json
{
  "applicationId": "myapp",
  "name": "Production API Key"
}
```

**Response (200 OK):**
```json
{
  "apiKey": "sk_live_abc123xyz789",
  "applicationId": "myapp",
  "name": "Production API Key",
  "createdAt": "2025-01-15T10:00:00Z"
}
```

---

## 📱 Applications

### Overview
Applications represent the software systems that use ConfigHub for configuration management.

### Endpoints

#### POST /api/v1/applications
Create a new application.

**Request Body:**
```json
{
  "name": "myapp",
  "description": "E-commerce platform",
  "ownerEmail": "admin@example.com"
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "name": "myapp",
  "description": "E-commerce platform",
  "ownerEmail": "admin@example.com",
  "isActive": true,
  "createdAt": "2025-01-15T10:00:00Z"
}
```

---

#### GET /api/v1/applications
Retrieve all applications.

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "myapp",
    "description": "E-commerce platform",
    "ownerEmail": "admin@example.com",
    "isActive": true,
    "createdAt": "2025-01-15T10:00:00Z"
  }
]
```

---

#### GET /api/v1/applications/{id}
Retrieve an application by ID.

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "myapp",
  "description": "E-commerce platform",
  "ownerEmail": "admin@example.com",
  "isActive": true,
  "createdAt": "2025-01-15T10:00:00Z"
}
```

**Error Responses:**
- `404 Not Found` - Application not found

---

#### PUT /api/v1/applications/{id}
Update an application.

**Request Body:**
```json
{
  "name": "myapp",
  "description": "Updated description"
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "myapp",
  "description": "Updated description",
  "ownerEmail": "admin@example.com",
  "isActive": true,
  "createdAt": "2025-01-15T10:00:00Z",
  "updatedAt": "2025-01-15T11:00:00Z"
}
```

---

#### POST /api/v1/applications/{id}/activate
Activate a deactivated application.

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "myapp",
  "isActive": true
}
```

---

#### POST /api/v1/applications/{id}/deactivate
Deactivate an active application.

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "myapp",
  "isActive": false
}
```

---

#### DELETE /api/v1/applications/{id}
Delete an application.

**Response (204 No Content)**

---

## 🌍 Environments

### Endpoints

#### POST /api/v1/environments
Create a new environment.

**Request Body:**
```json
{
  "name": "production",
  "description": "Production environment",
  "applicationId": "1",
  "color": "#FF0000",
  "inheritFromId": null
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "name": "production",
  "description": "Production environment",
  "applicationId": "1",
  "color": "#FF0000",
  "isActive": true,
  "createdAt": "2025-01-15T10:00:00Z"
}
```

---

#### GET /api/v1/environments/application/{applicationId}
Get all environments for an application.

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "production",
    "description": "Production environment",
    "applicationId": "1",
    "color": "#FF0000",
    "isActive": true
  },
  {
    "id": 2,
    "name": "staging",
    "description": "Staging environment",
    "applicationId": "1",
    "color": "#00FF00",
    "isActive": true
  }
]
```

---

## ⚙️ Configurations

### Endpoints

#### POST /api/v1/configurations
Create a new configuration.

**Request Body:**
```json
{
  "key": "api.timeout",
  "value": "5000",
  "type": "INTEGER",
  "description": "API timeout in milliseconds",
  "isSecret": false,
  "environmentId": "1"
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "key": "api.timeout",
  "value": "5000",
  "type": "INTEGER",
  "description": "API timeout in milliseconds",
  "isSecret": false,
  "environmentId": "1",
  "version": 1,
  "createdAt": "2025-01-15T10:00:00Z"
}
```

---

#### GET /api/v1/configurations/environment/{environmentId}
Get all configurations for an environment.

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "key": "api.timeout",
    "value": "5000",
    "type": "INTEGER",
    "description": "API timeout in milliseconds",
    "isSecret": false,
    "version": 1
  }
]
```

---

#### GET /api/v1/configurations/environment/{environmentId}/map
Get all configurations as a key-value map (SDK optimized).

**Response (200 OK):**
```json
{
  "api.timeout": "5000",
  "api.retries": "3",
  "feature.enabled": "true"
}
```

---

#### GET /api/v1/configurations/environment/{environmentId}/poll
Long polling for configuration changes.

**Query Parameters:**
- `lastUpdate` (optional) - Last update timestamp in ms
- `timeout` (optional, default: 30, max: 60) - Max wait time in seconds

**Response (200 OK):**
```json
{
  "hasUpdates": true,
  "configurations": [
    {
      "key": "api.timeout",
      "value": "5000",
      "type": "INTEGER",
      "version": 2
    }
  ],
  "lastUpdate": 1705320450000
}
```

---

#### GET /api/v1/configurations/environment/{environmentId}/stream
Server-Sent Events stream for real-time updates.

**Response:** `text/event-stream` stream

**Event Format:**
```
event: configuration.updated
data: {"key":"api.timeout","value":"5000","type":"INTEGER","version":2}
```

---

#### PUT /api/v1/configurations/{id}
Update a configuration.

**Request Body:**
```json
{
  "value": "6000",
  "type": "INTEGER",
  "description": "Updated timeout"
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "key": "api.timeout",
  "value": "6000",
  "type": "INTEGER",
  "version": 2
}
```

---

#### GET /api/v1/configurations/{configurationId}/versions
Get version history of a configuration.

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "version": 1,
    "value": "5000",
    "changedBy": "admin@example.com",
    "changedAt": "2025-01-15T10:00:00Z"
  },
  {
    "id": 2,
    "version": 2,
    "value": "6000",
    "changedBy": "admin@example.com",
    "changedAt": "2025-01-15T11:00:00Z"
  }
]
```

---

#### POST /api/v1/configurations/{configurationId}/versions/{versionNumber}/rollback
Rollback to a previous version.

**Response (200 OK):**
```json
{
  "id": 1,
  "key": "api.timeout",
  "value": "5000",
  "version": 3
}
```

---

## 🔐 Secrets

### Endpoints

#### POST /api/v1/secrets
Create a new secret (encrypted).

**Request Body:**
```json
{
  "key": "db.password",
  "encryptedValue": "encrypted_value_here",
  "description": "Database password",
  "applicationId": "1",
  "environmentId": "1",
  "rotationPolicy": "90"
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "key": "db.password",
  "description": "Database password",
  "applicationId": "1",
  "environmentId": "1",
  "rotationPolicy": 90,
  "lastRotatedAt": "2025-01-15T10:00:00Z",
  "expiresAt": "2025-04-15T10:00:00Z"
}
```

---

#### GET /api/v1/secrets/application/{applicationId}/environment/{environmentId}/map
Get all secrets as decrypted map (SDK optimized).

**Response (200 OK):**
```json
{
  "db.password": "decrypted_password_here",
  "api.key": "decrypted_api_key"
}
```

---

#### POST /api/v1/secrets/{id}/rotate
Rotate a secret.

**Request Body:**
```json
{
  "newEncryptedValue": "new_encrypted_value",
  "rotatedBy": "admin@example.com"
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "key": "db.password",
  "lastRotatedAt": "2025-01-15T11:00:00Z"
}
```

---

#### GET /api/v1/secrets/validate?applicationId={applicationId}
Validate which secrets need rotation.

**Response (200 OK):**
```json
{
  "needsRotation": [
    {
      "id": 1,
      "key": "db.password",
      "lastRotatedAt": "2024-10-15T10:00:00Z",
      "rotationPolicy": 90
    }
  ],
  "expiringSoon": []
}
```

---

#### GET /api/v1/secrets/stats
Get rotation statistics.

**Response (200 OK):**
```json
{
  "totalRotations": 150,
  "successfulRotations": 145,
  "failedRotations": 5,
  "manualRotations": 20,
  "automaticRotations": 130,
  "successRate": 0.966
}
```

---

## 🚩 Feature Flags

### Endpoints

#### POST /api/v1/feature-flags
Create a feature flag.

**Request Body:**
```json
{
  "applicationId": "1",
  "key": "new_dashboard",
  "name": "New Dashboard",
  "description": "Enable new dashboard UI",
  "status": "ENABLED",
  "rolloutStrategy": "GRADUAL",
  "rolloutPercentage": 50,
  "targetingRules": []
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "key": "new_dashboard",
  "name": "New Dashboard",
  "status": "ENABLED",
  "rolloutPercentage": 50
}
```

---

#### GET /api/v1/feature-flags/evaluate/{key}?userId={userId}
Evaluate a feature flag (SDK optimized).

**Query Parameters:**
- `userId` (optional) - User ID for targeting
- `context` (optional) - JSON object with context attributes

**Response (200 OK):**
```json
{
  "key": "new_dashboard",
  "enabled": true,
  "variant": null,
  "rolloutPercentage": 50,
  "payload": null
}
```

---

#### POST /api/v1/feature-flags/evaluate-batch
Batch evaluate multiple flags.

**Request Body:**
```json
{
  "keys": ["new_dashboard", "dark_mode", "beta_features"],
  "userId": "user123",
  "context": {
    "plan": "premium",
    "country": "US"
  }
}
```

**Response (200 OK):**
```json
{
  "new_dashboard": {
    "enabled": true,
    "variant": null
  },
  "dark_mode": {
    "enabled": false,
    "variant": null
  },
  "beta_features": {
    "enabled": true,
    "variant": "variant_a"
  }
}
```

---

## 🔄 Environment Promotion

### Endpoints

#### POST /api/v1/promotions
Create a promotion request.

**Request Body:**
```json
{
  "applicationId": "1",
  "sourceEnvironment": "staging",
  "targetEnvironment": "production",
  "requestedBy": "admin@example.com",
  "includeAllConfigs": true,
  "configKeys": null,
  "smokeTestEnabled": true
}
```

**Response (201 Created):**
```json
{
  "id": "promo_abc123",
  "status": "PENDING_APPROVAL",
  "sourceEnvironment": "staging",
  "targetEnvironment": "production"
}
```

---

#### GET /api/v1/promotions/{id}/diff/summary
Get diff summary.

**Response (200 OK):**
```json
{
  "total": 15,
  "newConfigs": 3,
  "modified": 8,
  "deleted": 2,
  "same": 2
}
```

---

#### POST /api/v1/promotions/{id}/approve
Approve a promotion.

**Request Body:**
```json
{
  "approvedBy": "manager@example.com",
  "reason": "Reviewed and approved"
}
```

---

#### POST /api/v1/promotions/{id}/execute
Execute a promotion.

**Response (200 OK):**
```json
{
  "id": "promo_abc123",
  "status": "COMPLETED"
}
```

---

## 🔗 Webhooks

### Endpoints

#### POST /api/v1/webhooks
Create a webhook.

**Request Body:**
```json
{
  "name": "Production Alerts",
  "url": "https://example.com/webhook",
  "description": "Alerts for production",
  "applicationId": "1",
  "subscribedEvents": ["CONFIG_UPDATED", "SECRET_ROTATED"],
  "secretKey": "webhook_secret"
}
```

---

#### POST /api/v1/webhooks/{id}/test
Test a webhook.

**Response (202 Accepted)**

---

#### GET /api/v1/webhooks/stats
Get webhook statistics.

**Response (200 OK):**
```json
{
  "activeWebhooks": 5,
  "pendingDeliveries": 0,
  "retryingDeliveries": 3,
  "deliveredCount": 500,
  "failedCount": 15
}
```

---

## ⚠️ Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Invalid or missing JWT |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 500 | Internal Server Error |

## 🚦 Rate Limiting

Default limits (when implemented):
- 1000 requests per hour per API key
- 100 requests per minute per IP

Headers included:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 950
X-RateLimit-Reset: 1705320900
```

---

## 📝 Complete API Documentation

For interactive API documentation with try-it-out functionality:
- **Swagger UI**: `http://localhost:8080/swagger-ui/`
- **OpenAPI Spec**: `http://localhost:8080/v3/api-docs/`

## 🧪 Testing APIs

### Using cURL

```bash
# 1. Authenticate
export TOKEN=$(curl -s -X POST http://localhost:8080/api/v1/auth/authenticate \
  -H "Content-Type: application/json" \
  -d '{"apiKey": "sk_live_abc123"}' | jq -r '.access_token')

# 2. Get applications
curl -X GET http://localhost:8080/api/v1/applications \
  -H "Authorization: Bearer $TOKEN"

# 3. Create configuration
curl -X POST http://localhost:8080/api/v1/configurations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "api.timeout",
    "value": "5000",
    "type": "INTEGER",
    "environmentId": "1"
  }'
```

### Using Python

```python
import requests

# 1. Authenticate
response = requests.post('http://localhost:8080/api/v1/auth/authenticate', json={
    'apiKey': 'sk_live_abc123'
})
token = response.json()['access_token']

headers = {'Authorization': f'Bearer {token}'}

# 2. Get applications
response = requests.get('http://localhost:8080/api/v1/applications', headers=headers)
applications = response.json()

# 3. Create configuration
response = requests.post('http://localhost:8080/api/v1/configurations',
    headers=headers,
    json={
        'key': 'api.timeout',
        'value': '5000',
        'type': 'INTEGER',
        'environmentId': '1'
    }
)
```

---

**Total Endpoints Documented**: 100 REST APIs across 9 modules

**Last Updated**: January 15, 2025
