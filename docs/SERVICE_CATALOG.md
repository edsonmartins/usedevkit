# Service Catalog - Complete Guide

## Overview

Service Catalog provides a centralized registry for all microservices in your architecture. Track service dependencies, monitor health, and onboard new developers efficiently.

**Key Feature**: Portal de onboarding para novos devs! 🚀

## Features

### Core Capabilities

- ✅ **Service Registry**: Centralized catalog of all services
- ✅ **Dependency Graph**: Visualize and manage service dependencies
- ✅ **Health Monitoring**: Automatic health checks with statistics
- ✅ **Circular Dependency Detection**: Detect dependency cycles automatically
- ✅ **Service Search**: Find services by name, type, team, or environment
- ✅ **Documentation Links**: Quick access to repos and docs

## Architecture

### Backend Components

```
src/main/java/com/devkit/services/
├── domain/
│   ├── ServiceEntity.java                      # Main service entity
│   ├── ServiceDependencyEntity.java            # Dependency relationship
│   ├── ServiceId.java (VO)                     # Service ID
│   ├── ServiceRepository.java                  # JPA Repository
│   └── ServiceRegistry.java                    # Business logic ⭐
└── rest/
    ├── ServiceController.java                  # REST API
    └── ServiceResponse.java                    # DTOs
```

### Frontend Components

```
src/app/services/
└── page.tsx                                   # Service catalog page ⭐
    - Service cards with status
    - Health statistics dashboard
    - Dependency visualization
    - Links to repos/docs
```

## REST API

### 1. Service Management

#### Register Service

```http
POST /api/v1/services
Content-Type: application/json

{
  "name": "payment-service",
  "version": "1.0.0",
  "description": "Handles payment processing",
  "repositoryUrl": "https://github.com/org/payment-service",
  "documentationUrl": "https://docs.payment.com",
  "type": "API",
  "owner": "john@example.com",
  "team": "payments",
  "language": "Java",
  "environment": "production",
  "port": 8080
}
```

**Response:**
```json
{
  "id": "svc_abc123",
  "name": "payment-service",
  "version": "1.0.0",
  "status": "UNKNOWN",
  "type": "API",
  "port": 8080,
  "isActive": true
}
```

#### Get Service

```http
GET /api/v1/services/{id}
```

#### List Services

```http
GET /api/v1/services?environment=production&team=payments
```

#### Deactivate Service

```http
DELETE /api/v1/services/{id}
```

### 2. Health Management

#### Get Health Statistics

```http
GET /api/v1/services/health/stats
```

**Response:**
```json
{
  "total": 25,
  "healthy": 20,
  "degraded": 3,
  "down": 1,
  "unknown": 1,
  "healthyPercentage": 80.0
}
```

#### Perform Health Check (All Services)

```http
POST /api/v1/services/health/check-all
```

#### Check Specific Service

```http
POST /api/v1/services/{id}/health/check
```

**Response:**
```json
"HEALTHY"
```

### 3. Dependency Management

#### Add Dependency

```http
POST /api/v1/services/{sourceId}/dependencies/{targetId}
Content-Type: application/json

{
  "type": "HTTP"
}
```

**Dependency Types:**
- `HTTP` - HTTP/REST API calls
- `GRPC` - gRPC calls
- `MESSAGE_QUEUE` - Message queue (Kafka, RabbitMQ)
- `DATABASE` - Database connections
- `CACHE` - Cache layers (Redis, Memcached)
- `SYNC` - Synchronous calls

#### Remove Dependency

```http
DELETE /api/v1/services/{sourceId}/dependencies/{targetId}
```

#### Get Dependency Graph

```http
GET /api/v1/services/dependency-graph
```

**Response:**
```json
{
  "payment-service:1.0.0": [
    {
      "serviceName": "database-service",
      "version": "2.1.0",
      "type": "DATABASE",
      "description": "PostgreSQL database"
    },
    {
      "serviceName": "notification-service",
      "version": "1.5.0",
      "type": "HTTP",
      "description": "Sends notifications"
    }
  ]
}
```

#### Get Service Dependents

```http
GET /api/v1/services/{id}/dependents
```

Returns list of services that depend on this service.

#### Detect Circular Dependencies

```http
GET /api/v1/services/dependencies/circular
```

**Response:**
```json
[
  {
    "serviceName": "service-a",
    "cycle": ["service-a:1.0", "service-b:1.0", "service-c:1.0", "service-a:1.0"]
  }
]
```

### 4. Search

#### Search Services

```http
GET /api/v1/services/search?query=payment
```

Searches by name and description.

## Real-World Use Cases

### Use Case 1: New Developer Onboarding

**Problem:** New developer joins the team, needs to understand the architecture.

**Solution:**

1. Access **/services** page
2. See all services with health status
3. Click on service to see:
   - Description
   - Repository link
   - Documentation link
   - Dependencies
   - Team owner

**Result:** Developer understands the architecture in minutes!

### Use Case 2: Service Impact Analysis

**Problem:** Need to take down a service for maintenance. What will be impacted?

**Solution:**

```bash
# Get dependents
GET /api/v1/services/database-service/dependents

# Response
[
  {
    "name": "payment-service",
    "status": "HEALTHY"
  },
  {
    "name": "order-service",
    "status": "HEALTHY"
  }
]
```

**Result:** Know exactly which services will be affected!

### Use Case 3: Dependency Health Tracking

**Problem:** Service is degraded, is it a dependency issue?

**Solution:**

1. Check service health status
2. View dependencies
3. Check health of each dependency
4. Identify the root cause

**Example:**
```
payment-service: DEGRADED
  └─ database-service: DOWN  ← Root cause!
  └─ notification-service: HEALTHY
```

### Use Case 4: Architecture Documentation

**Problem:** Need to document the microservices architecture.

**Solution:**

```bash
# Get dependency graph
GET /api/v1/services/dependency-graph

# Visualize with graphviz or similar tool
```

Generate automated architecture diagrams!

## Service Types

| Type | Description | Examples |
|------|-------------|----------|
| **API** | REST/HTTP APIs | payment-api, user-api |
| **WORKER** | Background workers | email-worker, report-worker |
| **WEB** | Frontend/web apps | admin-portal, customer-portal |
| **MOBILE** | Mobile apps | ios-app, android-app |
| **DATABASE** | Databases | postgresql, mongodb |
| **CACHE** | Cache layers | redis, memcached |
| **QUEUE** | Message queues | kafka, rabbitmq |
| **OTHER** | Other services | scheduler, batch-processor |

## Service Status

| Status | Description | Action |
|--------|-------------|--------|
| **HEALTHY** | Service is running normally | None |
| **DEGRADED** | Service is slow but responding | Investigate performance |
| **DOWN** | Service is not responding | Alert! Fix immediately |
| **UNKNOWN** | Health check not configured | Configure health check URL |

## Best Practices

### 1. Service Naming

✅ **Do:**
- Use kebab-case: `payment-service`, `user-api`
- Be descriptive: `payment-processing-service`
- Include context: `payment-service-prod`

❌ **Don't:**
- Use generic names: `service-1`, `api`
- Use camelCase: `paymentService`
- Use abbreviations: `pay-svc`

### 2. Versioning

✅ **Recommended: Semantic Versioning**
```
1.0.0 - Major.Minor.Patch
```

- **Major**: Breaking changes
- **Minor**: New features, backwards compatible
- **Patch**: Bug fixes

### 3. Health Check Configuration

Configure health check URL:

```json
{
  "healthCheckUrl": "http://payment-service:8080/actuator/health"
}
```

Health check should return:
```http
HTTP 200 OK
{
  "status": "UP"
}
```

### 4. Dependency Management

✅ **Best Practices:**
- Declare all dependencies explicitly
- Use appropriate dependency types
- Document why dependency exists
- Avoid circular dependencies
- Keep dependency graph shallow (<5 levels)

❌ **Avoid:**
- Hidden dependencies
- Circular dependencies
- Deep dependency chains
- Unnecessary dependencies

## Monitoring & Alerts

### Key Metrics

Monitor these metrics:

```bash
# Overall health
GET /api/v1/services/health/stats

# Circular dependencies (should be 0!)
GET /api/v1/services/dependencies/circular

# Services by environment
GET /api/v1/services?environment=production
```

### Alerting Rules

**Critical Alerts:**
- Service status changes to DOWN
- Circular dependencies detected
- Healthy percentage < 80%

**Warning Alerts:**
- Service status changes to DEGRADED
- Service has no health check configured
- Service has no owner assigned

## Web Interface

### Service Catalog Page

Navigate to **/services** to access:

**Features:**
1. **Health Dashboard**
   - Total services count
   - Healthy/Degraded/Down counts
   - Health rate percentage

2. **Service Cards**
   - Service name and version
   - Status badge with icon
   - Type and environment badges
   - Owner and team
   - Dependencies list
   - Links to repository/docs/health

3. **Actions**
   - Add new service
   - Perform health checks (all services)
   - View service details
   - Manage dependencies

## Troubleshooting

### Service Shows as UNKNOWN

**Issue:** Service status is UNKNOWN even though it's running.

**Solution:** Configure health check URL:
```json
{
  "healthCheckUrl": "http://my-service:8080/health"
}
```

### Circular Dependency Detected

**Issue:** Circular dependency warning.

**Solution:**
1. Check the cycle: `GET /api/v1/services/dependencies/circular`
2. Review dependencies in the cycle
3. Refactor to break the cycle
4. Use message queue or event-driven architecture

### Health Check Failing

**Issue:** Service marked as DOWN even though it's up.

**Solution:**
1. Verify health check URL is accessible
2. Check if health endpoint returns HTTP 200
3. Review service logs for errors
4. Test health endpoint manually:
   ```bash
   curl http://service:port/health
   ```

## Status

✅ **Sprint 9-10: Service Catalog** - COMPLETE

- ✅ Service registry with full CRUD
- ✅ Dependency graph with cycle detection
- ✅ Health monitoring and statistics
- ✅ Service search and filtering
- ✅ REST API complete
- ✅ Frontend UI with dashboard
- ✅ Documentation links support

## Future Enhancements

1. **Service Map Visualization**
   - Interactive dependency graph
   - Force-directed layout
   - Real-time health visualization

2. **Service Templates**
   - Pre-defined service types
   - Auto-generate service scaffolding
   - Standardized health checks

3. **Change History**
   - Track service version changes
   - Audit log of dependency changes
   - Service retirement workflow

4. **Metrics Integration**
   - CPU, memory, disk usage
   - Request rate, error rate
   - Custom metrics per service

5. **Auto-Discovery**
   - Automatically detect services
   - Kubernetes integration
   - Service mesh integration

## Support

- **Documentation**: `/docs`
- **Examples**: `/examples/service-catalog`
- **Issues**: GitHub Issues
