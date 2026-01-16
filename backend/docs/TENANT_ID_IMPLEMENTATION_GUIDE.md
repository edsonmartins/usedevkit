# @TenantId Implementation Guide for Hibernate 6

This guide explains how to add complete multi-tenancy support to existing entities using Hibernate 6's `@TenantId` annotation.

## Overview

Hibernate 6 provides built-in support for multi-tenancy through the `@TenantId` annotation. This allows automatic tenant filtering at the database level.

## Prerequisites

1. **Hibernate 6.2+** is already configured in the project
2. **Migration scripts V1 and V2** have been executed
3. Database tables now have `tenant_id` columns

## Implementation Steps

### Step 1: Add tenant_id Column to Entity

For each entity that needs multi-tenancy support, add the following field:

```java
import org.hibernate.annotations.TenantId;

@Entity
@Table(name = "your_table")
public class YourEntity extends BaseEntity {

    // Existing fields...

    @TenantId
    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;

    // Getters and Setters
    public Long getTenantId() {
        return tenantId;
    }

    public void setTenantId(Long tenantId) {
        this.tenantId = tenantId;
    }
}
```

### Step 2: Entities Requiring @TenantId

The following entities need `@TenantId` added:

#### Priority 1 - Core Entities
- [x] `ConfigurationEntity` - Already has tenant_id field (needs @TenantId annotation)
- [ ] `SecretEntity`
- [ ] `EnvironmentEntity`
- [ ] `FeatureFlagEntity`
- [ ] `FeatureFlagVariantEntity`

#### Priority 2 - Supporting Entities
- [ ] `ApplicationEntity` - Already has tenant_id field (needs @TenantId annotation)
- [ ] `ApplicationApiKeyEntity`
- [ ] `ServiceEntity`
- [ ] `ServiceDependencyEntity`
- [ ] `WebhookEntity`
- [ ] `WebhookDeliveryEntity`

#### Priority 3 - Template Entities
- [ ] `TemplateEntity`
- [ ] `TemplateVersionEntity`
- [ ] `BlueprintEntity`
- [ ] `BlueprintConfigEntity`

#### Priority 4 - Version/History Entities
- [ ] `ConfigurationVersionEntity`
- [ ] `SecretRotationEntity`

### Step 3: Configure Hibernate MultiTenancy

Add or update the Hibernate configuration in `application.yml` or `application.properties`:

```yaml
spring:
  jpa:
    properties:
      hibernate:
        multi_tenancy: SCHEMA  # or DISCRIMINATOR
        tenant_identifier_resolver: com.devkit.multitenancy.config.TenantIdentifierResolver
```

### Step 4: Create TenantIdentifierResolver

Create a class that implements `CurrentTenantIdentifierResolver`:

```java
package com.devkit.multitenancy.config;

import org.hibernate.context.spi.CurrentTenantIdentifierResolver;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class TenantIdentifierResolver implements CurrentTenantIdentifierResolver<Long> {

    @Override
    public Long resolveCurrentTenantIdentifier() {
        // Resolve tenant from JWT token, session, or request header
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null && authentication.getPrincipal() instanceof UserDetails) {
            // Extract tenant from custom UserDetails or JWT claims
            String tenantIdStr = authentication.getDetails().toString();
            return Long.parseLong(tenantIdStr);
        }

        // Fallback: read from request header
        HttpServletRequest request =
            ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes())
                .getRequest();

        String tenantHeader = request.getHeader("X-Tenant-ID");
        if (tenantHeader != null) {
            return Long.parseLong(tenantHeader);
        }

        throw new IllegalStateException("No tenant identifier found");
    }

    @Override
    public boolean validateExistingCurrentSessions(Long tenantId) {
        return true;
    }
}
```

### Step 5: Create TenantInterceptor

Create an interceptor to automatically set tenant context from HTTP requests:

```java
package com.devkit.multitenancy.interceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class TenantInterceptor implements HandlerInterceptor {

    private static final String TENANT_HEADER = "X-Tenant-ID";

    @Override
    public boolean preHandle(HttpServletRequest request,
                           HttpServletResponse response,
                           Object handler) throws Exception {
        String tenantId = request.getHeader(TENANT_HEADER);

        if (tenantId != null) {
            TenantContext.setCurrentTenant(Long.parseLong(tenantId));
        } else {
            // For authenticated users, extract from JWT/security context
            // ...
        }

        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request,
                               HttpServletResponse response,
                               Object handler,
                               Exception ex) {
        TenantContext.clear();
    }
}
```

Register the interceptor in `WebMvcConfigurer`:

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Autowired
    private TenantInterceptor tenantInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(tenantInterceptor)
                .addPathPatterns("/api/**");
    }
}
```

### Step 6: Create TenantContext

Create a ThreadLocal storage for tenant context:

```java
package com.devkit.multitenancy.context;

public class TenantContext {

    private static final ThreadLocal<Long> CURRENT_TENANT = new ThreadLocal<>();

    public static void setCurrentTenant(Long tenantId) {
        CURRENT_TENANT.set(tenantId);
    }

    public static Long getCurrentTenant() {
        return CURRENT_TENANT.get();
    }

    public static void clear() {
        CURRENT_TENANT.remove();
    }
}
```

### Step 7: Update Repository Methods

Repositories will automatically filter by tenant_id due to @TenantId annotation. However, you may want to add helper methods:

```java
@Repository
public interface ConfigurationRepository extends JpaRepository<ConfigurationEntity, ConfigurationId> {

    // Automatically filters by current tenant
    List<ConfigurationEntity> findByEnvironmentId(String environmentId);

    // Explicit tenant filtering (if needed for cross-tenant operations)
    @Query("SELECT c FROM ConfigurationEntity c WHERE c.tenantId = :tenantId")
    List<ConfigurationEntity> findAllByTenantId(@Param("tenantId") Long tenantId);
}
```

## Testing Multi-Tenancy

### 1. Test Data Isolation

```java
@Test
public void testTenantIsolation() {
    TenantContext.setCurrentTenant(1L);

    ConfigurationEntity config1 = configurationRepository.save(
        ConfigurationEntity.create("key1", "value1", ...)
    );

    TenantContext.setCurrentTenant(2L);

    ConfigurationEntity config2 = configurationRepository.save(
        ConfigurationEntity.create("key1", "value2", ...)
    );

    // Tenant 1 should only see config1
    TenantContext.setCurrentTenant(1L);
    List<ConfigurationEntity> tenant1Configs = configurationRepository.findAll();
    assertEquals(1, tenant1Configs.size());
    assertEquals("value1", tenant1Configs.get(0).getValue());

    // Tenant 2 should only see config2
    TenantContext.setCurrentTenant(2L);
    List<ConfigurationEntity> tenant2Configs = configurationRepository.findAll();
    assertEquals(1, tenant2Configs.size());
    assertEquals("value2", tenant2Configs.get(0).getValue());
}
```

### 2. Test API with Tenant Header

```bash
# Create configuration as Tenant 1
curl -X POST http://localhost:8080/api/v1/configurations \
  -H "X-Tenant-ID: 1" \
  -H "Content-Type: application/json" \
  -d '{"key": "api-key", "value": "secret123"}'

# Create configuration as Tenant 2
curl -X POST http://localhost:8080/api/v1/configurations \
  -H "X-Tenant-ID: 2" \
  -H "Content-Type: application/json" \
  -d '{"key": "api-key", "value": "different-secret"}'

# Get configurations as Tenant 1
curl -X GET http://localhost:8080/api/v1/configurations \
  -H "X-Tenant-ID: 1"
# Returns: {"key": "api-key", "value": "secret123"}

# Get configurations as Tenant 2
curl -X GET http://localhost:8080/api/v1/configurations \
  -H "X-Tenant-ID: 2"
# Returns: {"key": "api-key", "value": "different-secret"}
```

## Migration Checklist

### Database Migration
- [x] V1: Create multi-tenancy and RBAC tables
- [x] V2: Add tenant_id columns to existing tables

### Entity Updates
- [x] ApplicationEntity - Add @TenantId annotation
- [x] ConfigurationEntity - Add @TenantId annotation
- [ ] SecretEntity - Add tenant_id field and @TenantId
- [ ] EnvironmentEntity - Add tenant_id field and @TenantId
- [ ] FeatureFlagEntity - Add tenant_id field and @TenantId
- [ ] All other entities from list above

### Configuration
- [ ] Configure Hibernate multi-tenancy strategy
- [ ] Create TenantIdentifierResolver
- [ ] Create TenantInterceptor
- [ ] Create TenantContext
- [ ] Register interceptor in WebMvcConfigurer

### Testing
- [ ] Unit tests for tenant isolation
- [ ] Integration tests for multi-tenant API calls
- [ ] Manual testing with Postman collection

## Benefits of @TenantId

1. **Automatic Filtering**: Hibernate automatically adds `WHERE tenant_id = ?` to all queries
2. **Type Safety**: Compile-time checking of tenant field
3. **Data Isolation**: Built-in protection against cross-tenant data leaks
4. **Performance**: Tenant_id is indexed, queries remain efficient
5. **Simplicity**: No manual filtering needed in repositories

## Important Notes

1. **Never bypass @TenantId**: Always use tenant-aware queries
2. **Validate tenant access**: Check user belongs to tenant before setting context
3. **Log tenant changes**: Audit logs should include tenant_id
4. **Test thoroughly**: Ensure no cross-tenant data access is possible
5. **Document assumptions**: Clearly document multi-tenancy approach for developers

## Next Steps

1. Complete entity updates for all tables listed above
2. Implement Hibernate configuration classes
3. Add comprehensive testing
4. Update API documentation to include X-Tenant-ID header
5. Train team on multi-tenancy best practices

## References

- [Hibernate 6 Multi-Tenancy Documentation](https://docs.jboss.org/hibernate/orm/6.2/userguide/html_single/Hibernate_User_Guide.html#multitenacy)
- [Spring Boot Multi-Tenancy](https://spring.io/blog/2015/07/14/multi-tenancy-with-spring-boot-and-hibernate)
- Project Migration Scripts: `backend/src/main/resources/db/migration/`
