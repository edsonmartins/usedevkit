# Webhooks & Notifications

## Overview

Webhooks & Notifications enables real-time event delivery to external systems via HTTP webhooks, with automatic retry logic, delivery tracking, and support for email and Slack notifications.

## Features

- **HTTP Webhooks**: Real-time event delivery to external systems
- **9 Event Types**: Config changes, secret rotations, promotions, and more
- **Retry Logic**: Automatic retry with exponential backoff
- **HMAC Signatures**: Secure payload verification with secret keys
- **Delivery Tracking**: Complete audit trail of all deliveries
- **Status Management**: Active, Inactive, and Disabled states
- **Multi-Channel**: Email and Slack notifications support
- **Test Events**: Send test events to verify webhook configuration

## Use Cases

### 1. Notify on Configuration Changes

Get notified when configurations are created, updated, or deleted:

```java
// Triggered automatically when config changes
webhookDeliveryService.triggerEvent(
    WebhookEntity.WebhookEventType.CONFIG_UPDATED,
    "myapp",
    Map.of(
        "configKey", "api.timeout",
        "oldValue", "5000",
        "newValue", "3000",
        "environment", "production"
    )
);
```

**Webhook Payload:**
```json
{
  "event_id": "uuid-123",
  "event_type": "CONFIG_UPDATED",
  "timestamp": "2025-01-15T10:00:00Z",
  "webhook_id": 1,
  "configKey": "api.timeout",
  "oldValue": "5000",
  "newValue": "3000",
  "environment": "production"
}
```

### 2. Monitor Secret Rotations

Receive alerts when secrets are rotated:

```java
webhookDeliveryService.triggerEvent(
    WebhookEntity.WebhookEventType.SECRET_ROTATED,
    "myapp",
    Map.of(
        "secretKey", "db.password",
        "applicationId", "myapp",
        "environmentId", "production",
        "rotatedAt", "2025-01-15T10:00:00Z"
    )
);
```

### 3. Track Promotion Status

Monitor environment promotions:

```java
webhookDeliveryService.triggerEvent(
    WebhookEntity.WebhookEventType.PROMOTION_EXECUTED,
    "myapp",
    Map.of(
        "promotionId", "promo_abc123",
        "sourceEnvironment", "staging",
        "targetEnvironment", "production",
        "status", "COMPLETED"
    )
);
```

### 4. Send Slack Notifications

Notify team on Slack about critical events:

```java
notificationService.sendSlackMessage(
    "https://hooks.slack.com/services/YOUR/WEBHOOK/URL",
    "Configuration change detected in production",
    Map.of("configKey", "api.timeout", "action", "UPDATED")
);
```

### 5. Send Email Alerts

Email notifications for important events:

```java
notificationService.sendEmail(
    "admin@example.com",
    "Secret Rotated: db.password",
    "Secret has been rotated in production",
    Map.of("secretKey", "db.password", "environment", "production")
);
```

## Architecture

### Entities

#### WebhookEntity

Manages webhook configuration and delivery statistics:

```java
public enum WebhookStatus {
    ACTIVE,       // Receiving events
    INACTIVE,     // Paused
    DISABLED      // Auto-disabled after repeated failures
}

public enum WebhookEventType {
    CONFIG_CREATED,
    CONFIG_UPDATED,
    CONFIG_DELETED,
    SECRET_ROTATED,
    PROMOTION_CREATED,
    PROMOTION_APPROVED,
    PROMOTION_EXECUTED,
    PROMOTION_FAILED,
    SECRET_EXPIRED
}

@Entity
public class WebhookEntity {
    private String name;
    private String url;
    private String description;
    private WebhookStatus status;
    private String applicationId;
    private List<WebhookEventType> subscribedEvents;
    private String secretKey;
    private Integer maxRetryAttempts;
    private Integer retryIntervalSeconds;
    private Integer timeoutSeconds;
    private Instant lastSuccessAt;
    private Instant lastFailureAt;
    private Integer failureCount;
    private Long totalDeliveries;
    private Long successfulDeliveries;
    private Long failedDeliveries;
}
```

**Domain Methods:**

- `activate()` - Activate webhook
- `deactivate()` - Pause webhook
- `disable()` - Disable webhook
- `recordSuccess()` - Record successful delivery
- `recordFailure()` - Record failed delivery
- `isSubscribedTo(eventType)` - Check if subscribed to event

#### WebhookDeliveryEntity

Tracks individual webhook delivery attempts:

```java
public enum DeliveryStatus {
    PENDING,      // Scheduled for delivery
    DELIVERED,    // Successfully delivered
    FAILED,       // Failed to deliver
    RETRYING,     // Retry in progress
    TIMEOUT       // Request timed out
}

@Entity
public class WebhookDeliveryEntity {
    private WebhookEntity webhook;
    private String eventType;
    private String eventId;
    private String payload;
    private Integer responseStatusCode;
    private String responseBody;
    private DeliveryStatus status;
    private Integer attemptNumber;
    private Instant deliveredAt;
    private Long durationMilliseconds;
    private String errorMessage;
    private Instant nextRetryAt;
}
```

**Domain Methods:**

- `markAsDelivered(statusCode, body, headers, duration)` - Mark as successful
- `markAsFailed(errorMessage)` - Mark as failed
- `markAsTimeout(errorMessage)` - Mark as timeout
- `scheduleRetry(nextRetryAt)` - Schedule retry
- `shouldRetry(maxAttempts)` - Check if should retry

### Service Layer

#### WebhookDeliveryService

Core business logic for webhook management and delivery:

**Key Methods:**

```java
// Webhook management
Long createWebhook(name, url, description, applicationId, events, secret)
void updateWebhook(id, name, url, description, events, secret)
void activateWebhook(id)
void deactivateWebhook(id)
void deleteWebhook(id)

// Event delivery
void triggerEvent(eventType, applicationId, payload)
void deliverEvent(webhook, eventType, payload)

// Query methods
List<WebhookEntity> getAllWebhooks()
List<WebhookEntity> getActiveWebhooks()
List<WebhookDeliveryEntity> getWebhookDeliveries(webhookId)
WebhookStatsDTO getStatistics()

// Testing
void testWebhook(id)
```

**Retry Processing:**

```java
@Scheduled(fixedDelay = 60000) // Every minute
public void processPendingRetries() {
    List<WebhookDeliveryEntity> pending = deliveryRepository
        .findPendingRetries(Instant.now());

    for (WebhookDeliveryEntity delivery : pending) {
        WebhookEntity webhook = delivery.getWebhook();

        if (webhook.isActive()) {
            WebhookDeliveryEntity retry = WebhookDeliveryEntity
                .createRetryDelivery(delivery);

            executeDelivery(retry);
        }
    }
}
```

#### NotificationService

Service for email and Slack notifications:

**Key Methods:**

```java
void sendEmail(to, subject, message, metadata)
void sendSlackMessage(webhookUrl, message, metadata)
void sendNotification(channel, recipient, subject, message, metadata)

// Convenience methods
void notifyConfigChange(channel, recipient, appId, envId, key, action)
void notifySecretRotation(channel, recipient, key, appId, envId)
void notifyPromotionStatus(channel, recipient, promoId, status, source, target)
```

### REST API

#### Create Webhook

**POST** `/api/v1/webhooks`

```json
{
  "name": "Production Alerts",
  "url": "https://example.com/webhook",
  "description": "Alerts for production environment",
  "applicationId": "myapp",
  "subscribedEvents": ["CONFIG_UPDATED", "SECRET_ROTATED"],
  "secretKey": "optional-secret-key"
}
```

**Response:** `201 Created`

```json
{
  "id": 1,
  "name": "Production Alerts",
  "url": "https://example.com/webhook",
  "status": "ACTIVE",
  "totalDeliveries": 0,
  "successfulDeliveries": 0,
  "failedDeliveries": 0
}
```

#### List Webhooks

**GET** `/api/v1/webhooks?status=ACTIVE`

**Response:** `200 OK`

```json
[
  {
    "id": 1,
    "name": "Production Alerts",
    "url": "https://example.com/webhook",
    "status": "ACTIVE",
    "subscribedEvents": ["CONFIG_UPDATED"],
    "totalDeliveries": 150,
    "successfulDeliveries": 148,
    "failedDeliveries": 2
  }
]
```

#### Get Webhook Details

**GET** `/api/v1/webhooks/{id}`

**Response:** `200 OK`

```json
{
  "id": 1,
  "name": "Production Alerts",
  "url": "https://example.com/webhook",
  "status": "ACTIVE",
  "lastSuccessAt": "2025-01-15T10:00:00Z",
  "lastFailureAt": "2025-01-15T09:55:00Z",
  "failureCount": 0
}
```

#### Update Webhook

**PUT** `/api/v1/webhooks/{id}`

```json
{
  "name": "Production Alerts (Updated)",
  "url": "https://example.com/webhook/v2",
  "subscribedEvents": ["CONFIG_UPDATED", "SECRET_ROTATED"],
  "secretKey": "new-secret-key"
}
```

#### Activate/Deactivate Webhook

**POST** `/api/v1/webhooks/{id}/activate`
**POST** `/api/v1/webhooks/{id}/deactivate`

**Response:** `200 OK`

#### Test Webhook

**POST** `/api/v1/webhooks/{id}/test`

Sends a test event to verify webhook configuration.

**Response:** `202 Accepted`

#### Get Webhook Deliveries

**GET** `/api/v1/webhooks/{id}/deliveries`

**Response:** `200 OK`

```json
[
  {
    "id": 1,
    "eventType": "CONFIG_UPDATED",
    "status": "DELIVERED",
    "attemptNumber": 1,
    "responseStatusCode": 200,
    "durationMilliseconds": 145,
    "deliveredAt": "2025-01-15T10:00:00Z"
  }
]
```

#### Get Statistics

**GET** `/api/v1/webhooks/stats`

**Response:** `200 OK`

```json
{
  "activeWebhooks": 5,
  "inactiveWebhooks": 2,
  "disabledWebhooks": 1,
  "pendingDeliveries": 0,
  "retryingDeliveries": 3,
  "deliveredCount": 500,
  "failedCount": 15
}
```

#### Delete Webhook

**DELETE** `/api/v1/webhooks/{id}`

**Response:** `204 No Content`

## Workflow

### 1. Webhook Creation

1. User creates webhook with URL, subscribed events, and optional secret key
2. Status: **ACTIVE**
3. Ready to receive events

### 2. Event Triggering

```
Event Occurs (e.g., Config Updated)
    ↓
Find Active Webhooks Subscribed to Event
    ↓
For Each Webhook:
    1. Generate unique event ID
    2. Create delivery record (PENDING)
    3. Send HTTP POST to webhook URL
    4. Record response
    5. Update webhook stats
```

### 3. Delivery Success Path

```
HTTP POST → 200 OK
    ↓
Mark Delivery as DELIVERED
    ↓
Record Success in Webhook
    ↓
Update Stats (total++, successful++)
```

### 4. Delivery Failure Path

```
HTTP POST → Error (4xx, 5xx, Timeout)
    ↓
Mark Delivery as FAILED
    ↓
Record Failure in Webhook
    ↓
Check if attemptNumber < maxRetryAttempts
    ↓
If YES: Schedule Retry (nextRetryAt = now + retryInterval)
If NO: Disable Webhook
```

### 5. Retry Processing

```
Scheduled Task (every minute)
    ↓
Find Deliveries with RETRYING status and nextRetryAt <= now
    ↓
For Each:
    1. Create new delivery (attemptNumber++)
    2. Execute delivery
    3. If success: Mark all retries as DELIVERED
    4. If fail: Schedule next retry or disable webhook
```

## Best Practices

### 1. Always Use HTTPS for Webhook URLs

```java
// ✅ Good - secure
String url = "https://example.com/webhook";

// ❌ Bad - insecure
String url = "http://example.com/webhook";
```

### 2. Set Secret Key for HMAC Signature

```java
Long webhookId = webhookDeliveryService.createWebhook(
    "Production Alerts",
    "https://example.com/webhook",
    "Production alerts",
    "myapp",
    List.of(WebhookEntityType.WebhookEventType.CONFIG_UPDATED),
    "your-secret-key-here"  // Always set secret key
);
```

**Verify Signature on Receiver:**

```java
String signature = request.getHeader("X-Webhook-Signature");
String payload = request.getBody();

String expectedSignature = generateHmacSignature(payload, secretKey);

if (!signature.equals(expectedSignature)) {
    throw new SecurityException("Invalid signature");
}
```

### 3. Subscribe to Relevant Events Only

```java
// ✅ Good - specific events
List<WebhookEventType> events = List.of(
    WebhookEventType.CONFIG_UPDATED,
    WebhookEventType.SECRET_ROTATED
);

// ❌ Bad - all events (spam)
List<WebhookEventType> events = Arrays.asList(WebhookEventType.values());
```

### 4. Set Appropriate Retry Limits

```java
// For critical webhooks (production alerts)
webhook.setMaxRetryAttempts(5);  // More retries
webhook.setRetryIntervalSeconds(120);  // Longer interval

// For non-critical webhooks
webhook.setMaxRetryAttempts(2);  // Fewer retries
webhook.setRetryIntervalSeconds(60);  // Standard interval
```

### 5. Monitor Webhook Health

```java
WebhookStatsDTO stats = webhookDeliveryService.getStatistics();

double successRate = (double) stats.deliveredCount() /
    (stats.deliveredCount() + stats.failedCount());

if (successRate < 0.95) {
    logger.warn("Low webhook success rate: {}", successRate);

    // Send alert to administrators
    notificationService.sendEmail(
        "admin@example.com",
        "Webhook Delivery Issues",
        "Success rate dropped below 95%",
        Map.of("successRate", String.valueOf(successRate))
    );
}
```

### 6. Test Webhooks Before Production

```java
// Create webhook
Long webhookId = createTestWebhook();

// Send test event
webhookDeliveryService.testWebhook(webhookId);

// Verify delivery
List<WebhookDeliveryEntity> deliveries = webhookDeliveryService
    .getWebhookDeliveries(webhookId);

WebhookDeliveryEntity lastDelivery = deliveries.get(0);

if (lastDelivery.getStatus() == DeliveryStatus.DELIVERED) {
    logger.info("Webhook test successful!");
} else {
    logger.error("Webhook test failed: {}",
        lastDelivery.getErrorMessage());
}
```

## Webhook Payload Format

All webhook payloads follow this structure:

```json
{
  "event_id": "uuid-unique-id",
  "event_type": "CONFIG_UPDATED",
  "timestamp": "2025-01-15T10:00:00Z",
  "webhook_id": 1,
  "customField1": "value1",
  "customField2": "value2"
}
```

### Example Payloads

**CONFIG_UPDATED:**
```json
{
  "event_id": "abc-123",
  "event_type": "CONFIG_UPDATED",
  "timestamp": "2025-01-15T10:00:00Z",
  "webhook_id": 1,
  "configKey": "api.timeout",
  "oldValue": "5000",
  "newValue": "3000",
  "environment": "production",
  "applicationId": "myapp"
}
```

**SECRET_ROTATED:**
```json
{
  "event_id": "def-456",
  "event_type": "SECRET_ROTATED",
  "timestamp": "2025-01-15T10:00:00Z",
  "webhook_id": 1,
  "secretKey": "db.password",
  "applicationId": "myapp",
  "environmentId": "production",
  "rotationReason": "AUTOMATIC_SCHEDULED"
}
```

**PROMOTION_EXECUTED:**
```json
{
  "event_id": "ghi-789",
  "event_type": "PROMOTION_EXECUTED",
  "timestamp": "2025-01-15T10:00:00Z",
  "webhook_id": 1,
  "promotionId": "promo_abc123",
  "sourceEnvironment": "staging",
  "targetEnvironment": "production",
  "status": "COMPLETED"
}
```

## HTTP Headers

Every webhook delivery includes these headers:

```
Content-Type: application/json
X-Webhook-Event: CONFIG_UPDATED
X-Webhook-ID: abc-123
X-Webhook-Delivery-ID: 456
X-Webhook-Signature: sha256=Base64EncodedHMAC
User-Agent: ConfigHub-Webhook/1.0
```

## Frontend UI

Access the Webhooks UI at: `http://localhost:3000/webhooks`

### Features

- **Dashboard**: Real-time statistics (active, inactive, disabled webhooks)
- **Webhook List**: Filter by status, view delivery statistics
- **Delivery History**: View recent deliveries with status and duration
- **Test Button**: Send test events to verify configuration
- **Activate/Deactivate**: Toggle webhook status
- **Create/Edit**: Manage webhook configuration
- **Event Selection**: Subscribe to specific event types

## Error Handling

### Common Errors

**1. "Webhook not found"**
```
Cause: Webhook ID does not exist
Solution: Verify webhook ID is correct
```

**2. "Connection timeout"**
```
Cause: Webhook URL is unreachable or slow
Solution: Check webhook URL is accessible, increase timeout
```

**3. "HTTP 4xx error"**
```
Cause: Client error (e.g., 400 Bad Request, 401 Unauthorized)
Solution: Verify webhook endpoint is correctly implemented
```

**4. "HTTP 5xx error"**
```
Cause: Server error at webhook endpoint
Solution: Check webhook endpoint logs, retry later
```

**5. "Webhook auto-disabled"**
```
Cause: Too many consecutive failures (≥ maxRetryAttempts)
Solution: Fix webhook endpoint, manually re-activate webhook
```

## Security Considerations

### 1. Verify Signatures

Always verify HMAC signatures on the receiver side:

```java
public boolean verifySignature(String payload, String signature, String secret) {
    String expectedSignature = generateHmacSignature(payload, secret);

    // Constant-time comparison to prevent timing attacks
    return MessageDigest.isEqual(
        signature.getBytes(StandardCharsets.UTF_8),
        expectedSignature.getBytes(StandardCharsets.UTF_8)
    );
}
```

### 2. Use HTTPS

Always use HTTPS URLs for webhooks to encrypt data in transit.

### 3. Limit Rate

Implement rate limiting on webhook endpoints to prevent abuse:

```java
@RateLimit(requests = 100, per = "1m")
@PostMapping("/webhook")
public ResponseEntity<Void> handleWebhook(@RequestBody String payload) {
    // Process webhook
}
```

### 4. Validate Payloads

Validate webhook payloads before processing:

```java
@PostMapping("/webhook")
public ResponseEntity<Void> handleWebhook(@RequestBody Map<String, Object> payload) {
    String eventType = (String) payload.get("event_type");
    String eventId = (String) payload.get("event_id");

    if (eventType == null || eventId == null) {
        return ResponseEntity.badRequest().build();
    }

    // Process valid payload
}
```

## Monitoring and Logging

### Audit Trail

Every webhook delivery is tracked:

```java
WebhookDeliveryEntity delivery = deliveryRepository.findById(deliveryId);

System.out.println("Event: " + delivery.getEventType());
System.out.println("Status: " + delivery.getStatus());
System.out.println("Attempt: " + delivery.getAttemptNumber());
System.out.println("Duration: " + delivery.getDurationMilliseconds() + "ms");
System.out.println("Response: " + delivery.getResponseStatusCode());
```

### Health Monitoring

Monitor webhook delivery health:

```java
List<WebhookEntity> webhooks = webhookRepository.findByStatus(WebhookStatus.ACTIVE);

for (WebhookEntity webhook : webhooks) {
    double successRate = (double) webhook.getSuccessfulDeliveries() /
        webhook.getTotalDeliveries();

    if (successRate < 0.95) {
        logger.warn("Webhook {} has low success rate: {}%",
            webhook.getId(), successRate * 100);
    }
}
```

## Integration Examples

### Slack Integration

```java
public class SlackNotifier {

    public void notifyConfigChange(String configKey, String oldValue, String newValue) {
        String message = String.format(
            "Configuration change detected:\n" +
            "• Key: %s\n" +
            "• Old Value: %s\n" +
            "• New Value: %s",
            configKey, oldValue, newValue
        );

        notificationService.sendSlackMessage(
            "https://hooks.slack.com/services/YOUR/WEBHOOK/URL",
            message,
            Map.of("configKey", configKey)
        );
    }
}
```

### Discord Integration (via Webhook)

```java
// Create webhook in ConfigHub pointing to Discord webhook URL
Long webhookId = webhookDeliveryService.createWebhook(
    "Discord Alerts",
    "https://discord.com/api/webhooks/YOUR/WEBHOOK/URL",
    "Alerts to Discord channel",
    null,
    List.of(WebhookEventType.CONFIG_UPDATED),
    null
);

// Events will be automatically delivered to Discord
```

### Email Integration

```java
// Send email on critical events
notificationService.sendEmail(
    "admin@example.com",
    "Critical: Configuration Change in Production",
    "A configuration has been changed in production environment",
    Map.of(
        "configKey", "api.timeout",
        "environment", "production",
        "changedBy", "admin@example.com"
    )
);
```

## Testing

### Unit Tests

```java
@Test
void shouldCreateWebhook() {
    Long webhookId = webhookDeliveryService.createWebhook(
        "Test Webhook",
        "https://example.com/webhook",
        "Test",
        null,
        List.of(WebhookEventType.CONFIG_UPDATED),
        null
    );

    assertNotNull(webhookId);

    WebhookEntity webhook = webhookDeliveryService.getWebhook(webhookId);
    assertEquals(WebhookStatus.ACTIVE, webhook.getStatus());
}

@Test
void shouldDeliverEvent() {
    Long webhookId = createTestWebhook();

    webhookDeliveryService.triggerEvent(
        WebhookEventType.CONFIG_UPDATED,
        "myapp",
        Map.of("configKey", "test.key")
    );

    List<WebhookDeliveryEntity> deliveries = webhookDeliveryService
        .getWebhookDeliveries(webhookId);

    assertFalse(deliveries.isEmpty());
}
```

### Integration Tests

```java
@Test
void shouldRetryFailedDelivery() {
    // Create webhook with invalid URL
    Long webhookId = webhookDeliveryService.createWebhook(
        "Test Webhook",
        "https://invalid-url-that-will-fail.com/webhook",
        "Test",
        null,
        List.of(WebhookEventType.CONFIG_UPDATED),
        null
    );

    // Trigger event
    webhookDeliveryService.triggerEvent(...);

    // Wait for retry
    Thread.sleep(65000);

    // Verify retry was attempted
    List<WebhookDeliveryEntity> deliveries = webhookDeliveryService
        .getWebhookDeliveries(webhookId);

    assertTrue(deliveries.size() > 1); // Initial + retry
}
```

## Related Features

- **Configuration Management**: Events for config changes
- **Secrets Rotation**: Events for secret rotations
- **Environment Promotion**: Events for promotion status
- **Audit Logs**: Track all webhook deliveries
- **Monitoring**: Real-time webhook statistics

## References

- **Domain**: `com.devkit.webhooks.domain`
- **REST API**: `com.devkit.webhooks.rest`
- **Frontend**: `/webhooks`
- **Database**: `webhooks`, `webhook_deliveries`, `webhook_subscribed_events`
