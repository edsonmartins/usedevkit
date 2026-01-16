# Environment Promotion

## Overview

Environment Promotion enables safe and controlled promotion of configurations between environments (e.g., Dev → Staging → Production). It provides an approval workflow, configuration diff visualization, smoke testing, and rollback capabilities.

## Features

- **Approval Workflow**: Multi-stage approval process (PENDING → APPROVED → IN_PROGRESS → COMPLETED)
- **Configuration Diff**: Visual comparison of configurations between environments
- **Change Types**: NEW, MODIFIED, DELETED, SAME
- **Smoke Tests**: Automated validation before applying changes
- **Rollback Safety**: Automatic rollback on failure
- **Selective Promotion**: Promote all configs or specific keys
- **Audit Trail**: Complete history of all promotions with timestamps

## Use Cases

### 1. Dev to Staging Promotion

Promote tested configurations from development to staging environment:

```java
String promotionId = promotionService.createPromotionRequest(
    "myapp",           // applicationId
    "dev",             // sourceEnvironment
    "staging",         // targetEnvironment
    "admin@example.com", // requestedBy
    true,              // includeAllConfigs
    null,              // configKeys (all)
    true               // smokeTestEnabled
);
```

### 2. Staging to Production Promotion

Promote specific configurations to production with approval:

```java
String promotionId = promotionService.createPromotionRequest(
    "myapp",
    "staging",
    "production",
    "admin@example.com",
    false,             // selective configs
    List.of("api.timeout", "cache.ttl", "feature.flags"),
    true               // enable smoke tests
);

// Review diffs
List<PromotionDiffEntity> diffs = promotionService.calculateDiffs(promotionId);

// Approve
promotionService.approvePromotion(promotionId, "manager@example.com", "Reviewed and approved");

// Execute
promotionService.executePromotion(promotionId);
```

### 3. Rollback Failed Promotion

Rollback a promotion if smoke tests fail or errors occur:

```java
try {
    promotionService.executePromotion(promotionId);
} catch (Exception e) {
    // Automatic rollback on failure
    promotionService.rollbackPromotion(promotionId, "Execution failed: " + e.getMessage());
}
```

## Architecture

### Entities

#### PromotionRequestEntity

Represents a promotion request with full lifecycle tracking:

```java
public enum PromotionStatus {
    PENDING_APPROVAL,  // Waiting for approval
    APPROVED,          // Approved, ready to execute
    REJECTED,          // Rejected by approver
    IN_PROGRESS,       // Currently executing
    COMPLETED,         // Successfully completed
    FAILED,            // Execution failed
    ROLLED_BACK        // Rolled back after completion
}

@Entity
public class PromotionRequestEntity {
    private PromotionRequestId id;
    private String applicationId;
    private String sourceEnvironment;
    private String targetEnvironment;
    private PromotionStatus status;
    private String requestedBy;
    private String approvedBy;
    private String approvalReason;
    private String rejectionReason;
    private Instant createdAt;
    private Instant approvedAt;
    private Instant completedAt;
    private Boolean includeAllConfigs;
    private String configKeys;
    private Boolean smokeTestEnabled;
    private String smokeTestResult;
    private List<PromotionDiffEntity> diffs;
}
```

**Domain Methods:**

- `approve(approvedBy, reason)` - Approve a pending request
- `reject(rejectedBy, reason)` - Reject a pending request
- `startPromotion()` - Start execution (approved only)
- `complete()` - Mark as completed
- `fail(errorMessage)` - Mark as failed
- `rollback(reason)` - Rollback a completed promotion

#### PromotionDiffEntity

Tracks individual configuration differences:

```java
public enum ChangeType {
    NEW,        // Configuration exists in source but not in target
    MODIFIED,   // Configuration exists in both but value is different
    DELETED,    // Configuration exists in target but not in source
    SAME        // Configuration is the same in both
}

@Entity
public class PromotionDiffEntity {
    private String promotionRequestId;
    private String configKey;
    private String sourceValue;
    private String targetValue;
    private String sourceType;
    private String targetType;
    private Integer sourceVersion;
    private Integer targetVersion;
    private ChangeType changeType;
}
```

**Factory Methods:**

- `newConfig(...)` - Create a NEW config diff
- `modifiedConfig(...)` - Create a MODIFIED config diff
- `deletedConfig(...)` - Create a DELETED config diff
- `sameConfig(...)` - Create a SAME config diff

### Service Layer

#### EnvironmentPromotionService

Core business logic for promotion management:

**Key Methods:**

```java
// Create promotion request
String createPromotionRequest(
    String applicationId,
    String sourceEnvironment,
    String targetEnvironment,
    String requestedBy,
    Boolean includeAllConfigs,
    List<String> configKeys,
    Boolean smokeTestEnabled
)

// Calculate diffs
List<PromotionDiffEntity> calculateDiffs(String promotionRequestId)

// Approval workflow
void approvePromotion(String promotionRequestId, String approvedBy, String reason)
void rejectPromotion(String promotionRequestId, String rejectedBy, String reason)

// Execution
void executePromotion(String promotionRequestId)
void rollbackPromotion(String promotionRequestId, String reason)

// Queries
DiffSummary getDiffSummary(String promotionRequestId)
List<PromotionRequestEntity> findByApplicationId(String applicationId)
long countByStatus(PromotionStatus status)
```

### REST API

#### Create Promotion Request

**POST** `/api/v1/promotions`

```json
{
  "applicationId": "myapp",
  "sourceEnvironment": "dev",
  "targetEnvironment": "staging",
  "requestedBy": "admin@example.com",
  "includeAllConfigs": true,
  "configKeys": null,
  "smokeTestEnabled": true
}
```

**Response:** `201 Created`

```json
{
  "id": "promo_abc123",
  "applicationId": "myapp",
  "sourceEnvironment": "dev",
  "targetEnvironment": "staging",
  "status": "PENDING_APPROVAL",
  "createdAt": "2025-01-15T10:00:00Z"
}
```

#### Get Promotion Request

**GET** `/api/v1/promotions/{id}`

**Response:** `200 OK`

```json
{
  "id": "promo_abc123",
  "applicationId": "myapp",
  "sourceEnvironment": "dev",
  "targetEnvironment": "staging",
  "status": "PENDING_APPROVAL",
  "diffs": [
    {
      "configKey": "api.timeout",
      "sourceValue": "5000",
      "targetValue": "3000",
      "changeType": "MODIFIED"
    }
  ]
}
```

#### Approve Promotion

**POST** `/api/v1/promotions/{id}/approve`

```json
{
  "approvedBy": "manager@example.com",
  "reason": "Reviewed and approved for staging"
}
```

#### Reject Promotion

**POST** `/api/v1/promotions/{id}/reject`

```json
{
  "rejectedBy": "manager@example.com",
  "reason": "Smoke tests not passing"
}
```

#### Execute Promotion

**POST** `/api/v1/promotions/{id}/execute`

**Response:** `200 OK`

#### Rollback Promotion

**POST** `/api/v1/promotions/{id}/rollback?reason=Production+issue`

**Response:** `200 OK`

#### List Promotions

**GET** `/api/v1/promotions?applicationId=myapp&status=PENDING_APPROVAL`

**Response:** `200 OK`

```json
[
  {
    "id": "promo_abc123",
    "applicationId": "myapp",
    "status": "PENDING_APPROVAL"
  }
]
```

#### Get Diff Summary

**GET** `/api/v1/promotions/{id}/diff/summary`

**Response:** `200 OK`

```json
{
  "total": 15,
  "newConfigs": 3,
  "modified": 8,
  "deleted": 2,
  "same": 2
}
```

#### Get Statistics

**GET** `/api/v1/promotions/stats`

**Response:** `200 OK`

```json
{
  "pendingCount": 5,
  "approvedCount": 2,
  "completedCount": 150,
  "failedCount": 3,
  "rejectedCount": 10
}
```

## Workflow

### 1. Creation Phase

1. User creates promotion request
2. System calculates diffs between source and target
3. Status: **PENDING_APPROVAL**

### 2. Approval Phase

**Option A: Approve**
1. Approver reviews diffs
2. Approver approves with reason
3. Status: **APPROVED**

**Option B: Reject**
1. Approver reviews diffs
2. Approver rejects with reason
3. Status: **REJECTED**

### 3. Execution Phase

1. User executes approved promotion
2. Status: **IN_PROGRESS**

3a. **If smoke tests enabled:**
   - Run smoke tests
   - If failed: Status → **FAILED** (auto rollback)
   - If passed: Continue

3b. **Apply configuration changes:**
   - Create NEW configs in target
   - Update MODIFIED configs in target
   - Delete DELETED configs from target

4. Status: **COMPLETED**

### 4. Rollback Phase (if needed)

1. User triggers rollback
2. System restores previous values:
   - Delete NEW configs
   - Restore MODIFIED configs to target values
   - Recreate DELETED configs
3. Status: **ROLLED_BACK**

## Best Practices

### 1. Always Enable Smoke Tests

```java
String promotionId = promotionService.createPromotionRequest(
    "myapp", "staging", "production",
    "admin@example.com",
    true, null,
    true  // Always enable in production
);
```

### 2. Selective Promotion for Production

```java
// Promote only critical configs to production
String promotionId = promotionService.createPromotionRequest(
    "myapp", "staging", "production",
    "admin@example.com",
    false,  // Selective
    List.of("api.timeout", "cache.ttl", "feature.flags"),
    true
);
```

### 3. Review Diffs Before Approval

```java
List<PromotionDiffEntity> diffs = promotionService.calculateDiffs(promotionId);

long modifiedCount = diffs.stream()
    .filter(d -> d.getChangeType() == ChangeType.MODIFIED)
    .count();

if (modifiedCount > 10) {
    // Too many changes, require additional review
}
```

### 4. Monitor Failed Promotions

```java
List<PromotionRequestEntity> failed = promotionRepository.findByStatus(
    PromotionStatus.FAILED
);

for (PromotionRequestEntity request : failed) {
    logger.error("Failed promotion: {} - {}",
        request.getId(),
        request.getErrorMessage());
}
```

### 5. Automate Rollback on Failure

```java
try {
    promotionService.executePromotion(promotionId);
} catch (Exception e) {
    // Automatically rollback on any failure
    promotionService.rollbackPromotion(promotionId, "Auto-rollback: " + e.getMessage());
}
```

## Frontend UI

Access the Environment Promotion UI at: `http://localhost:3000/promotions`

### Features

- **Dashboard**: Real-time statistics (pending, approved, completed, failed)
- **Promotion List**: Filter by status (All, Pending, Approved, Completed)
- **Diff Visualization**: Side-by-side comparison of configuration changes
- **Approval Actions**: Approve/Reject buttons with reasons
- **Execution Actions**: Execute and Rollback buttons
- **Create Dialog**: Form to create new promotion requests

### UI Screenshots

**Promotion List:**
```
┌─────────────────────────────────────────────────┐
│ Environment Promotions                          │
├─────────────────────────────────────────────────┤
│ Statistics:                                     │
│ [5] Pending  [2] Approved  [150] Completed      │
├─────────────────────────────────────────────────┤
│ Promotion Requests:                             │
│ ┌──────────────────────────────────────────┐   │
│ │ myapp (dev → staging)            [PENDING]│   │
│ │ 2025-01-15 10:00:00                     │   │
│ └──────────────────────────────────────────┘   │
│ ┌──────────────────────────────────────────┐   │
│ │ myapp (staging → prod)            [APPROVED]│   │
│ │ 2025-01-15 09:30:00                     │   │
│ └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

**Diff Visualization:**
```
Configuration Diffs:
┌──────────────────────────────────────────────────┐
│ Key           │ Change    │ Source    │ Target  │
├──────────────────────────────────────────────────┤
│ api.timeout   │ MODIFIED  │ 5000      │ 3000    │
│ cache.ttl     │ NEW       │ -         │ 3600    │
│ old.feature   │ DELETED   │ true      │ -       │
│ feature.flags │ SAME      │ false     │ false   │
└──────────────────────────────────────────────────┘
```

## Monitoring and Auditing

### Audit Trail

Every promotion maintains complete audit history:

```java
PromotionRequestEntity request = promotionRepository.findById(id);

System.out.println("Created by: " + request.getRequestedBy());
System.out.println("Created at: " + request.getCreatedAt());
System.out.println("Approved by: " + request.getApprovedBy());
System.out.println("Approved at: " + request.getApprovedAt());
System.out.println("Reason: " + request.getApprovalReason());
```

### Statistics

Monitor promotion health:

```java
PromotionStatsDTO stats = promotionService.getStatistics();

double successRate = (double) stats.completedCount() /
    (stats.completedCount() + stats.failedCount());

if (successRate < 0.95) {
    logger.warn("Low promotion success rate: {}", successRate);
}
```

## Error Handling

### Common Errors

**1. "Can only approve pending requests"**
```
Cause: Trying to approve a non-pending request
Solution: Check promotion status before approving
```

**2. "Can only start approved promotions"**
```
Cause: Trying to execute a non-approved request
Solution: Ensure promotion is approved before execution
```

**3. "Smoke tests failed"**
```
Cause: Smoke tests returned failure
Solution: Review smoke test results, fix issues, retry
```

**4. "Configuration not found"**
```
Cause: Source or target environment missing
Solution: Verify environment exists and has configurations
```

## Security Considerations

### 1. Approval Workflow

Always require approval for production promotions:

```java
if (targetEnvironment.equals("production")) {
    if (status != PromotionStatus.APPROVED) {
        throw new IllegalStateException(
            "Production promotions require approval"
        );
    }
}
```

### 2. Audit Logging

Log all promotion actions:

```java
promotionService.approvePromotion(id, approvedBy, reason);
logger.info("Promotion {} approved by {} with reason: {}",
    id, approvedBy, reason);
```

### 3. Role-Based Access

Control who can execute promotions:

```java
@PostMapping("/{id}/execute")
public ResponseEntity<?> execute(
    @PathVariable String id,
    @AuthenticationPrincipal User user) {

    if (!user.hasRole("DEPLOYER")) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    promotionService.executePromotion(id);
}
```

## Testing

### Unit Tests

```java
@Test
void shouldCreatePromotionRequest() {
    String id = promotionService.createPromotionRequest(
        "myapp", "dev", "staging",
        "admin@example.com",
        true, null, true
    );

    assertNotNull(id);
    assertTrue(id.startsWith("promo_"));
}

@Test
void shouldApprovePromotion() {
    String id = createPromotion();
    promotionService.approvePromotion(id, "manager@example.com", "OK");

    PromotionRequestEntity request = promotionRepository.findById(id);
    assertEquals(PromotionStatus.APPROVED, request.getStatus());
}
```

### Integration Tests

```java
@Test
void shouldExecutePromotionEndToEnd() {
    // 1. Create
    String id = promotionService.createPromotionRequest(...);

    // 2. Approve
    promotionService.approvePromotion(id, ...);

    // 3. Execute
    promotionService.executePromotion(id);

    // 4. Verify
    PromotionRequestEntity request = promotionRepository.findById(id);
    assertEquals(PromotionStatus.COMPLETED, request.getStatus());
}
```

## Migration from Manual Deployments

### Before (Manual)

```bash
# Manual copy-paste of configurations
cp config/dev.properties config/staging.properties
# Risk of errors, no audit trail
```

### After (Automated)

```java
// Safe, tracked, reversible
String id = promotionService.createPromotionRequest(
    "myapp", "dev", "staging",
    "admin@example.com",
    true, null, true
);

// Review diffs, approve, execute with full audit trail
```

## Future Enhancements

- [ ] Scheduled promotions (execute at specific time)
- [ ] Promotion templates (common configs)
- [ ] Multi-environment promotion (dev → staging → prod)
- [ ] Approval chains (multiple approvers)
- [ ] Promotion policies (require 2 approvals for prod)
- [ ] Integration with CI/CD pipelines
- [ ] Promotion notifications (webhooks, email)

## Related Features

- **Configuration Management**: Store and version configurations
- **Secrets Rotation**: Rotate credentials with promotion
- **Service Catalog**: Track dependent services during promotion
- **Webhooks**: Notify external systems of promotion events

## References

- **Domain**: `com.devkit.promotions.domain`
- **REST API**: `com.devkit.promotions.rest`
- **Frontend**: `/promotions`
- **Database**: `promotion_requests`, `promotion_diffs`
