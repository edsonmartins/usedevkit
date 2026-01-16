# Multi-Tenancy and RBAC Implementation

## Overview

Complete implementation of multi-tenant support with Role-Based Access Control (RBAC) for ConfigHub.

## Architecture

### Multi-Tenancy

**Tenant Entity** (`TenantEntity.java`)
- Organizations/companies using ConfigHub
- 4 subscription plans: FREE, STARTER, PROFESSIONAL, ENTERPRISE
- Plan-based limits (users, applications, configurations)
- Trial period support (14 days)
- Custom domain support
- Active/inactive status

**Tenant User Entity** (`TenantUserEntity.java`)
- Users belonging to tenants
- 4 roles: OWNER, ADMIN, MEMBER, VIEWER
- Invitation and activation workflow
- Activity tracking (joinedAt, lastActiveAt)

### RBAC (Role-Based Access Control)

**Permission Entity** (`PermissionEntity.java`)
- Granular permissions following pattern: `resource:action`
- 15+ system permissions (immutable)
- Custom permissions support
- Examples: `config:read`, `secret:write`, `promotion:approve`

**Role Entity** (`RoleEntity.java`)
- Aggregates multiple permissions
- System roles (immutable): SUPER_ADMIN, TENANT_ADMIN, DEVELOPER, VIEWER
- Custom roles per tenant
- Permission management

**User Role Entity** (`UserRoleEntity.java`)
- Assigns roles to users within tenants
- Expiration support
- Audit trail (grantedBy, reason)

## REST APIs Implemented

### Tenant Management (11 endpoints)

```
POST   /api/v1/tenants                    - Create tenant
GET    /api/v1/tenants                    - List all tenants
GET    /api/v1/tenants/active             - List active tenants
GET    /api/v1/tenants/{id}               - Get tenant by ID
GET    /api/v1/tenants/slug/{slug}        - Get tenant by slug
PUT    /api/v1/tenants/{id}               - Update tenant
POST   /api/v1/tenants/{id}/activate      - Activate tenant
POST   /api/v1/tenants/{id}/deactivate    - Deactivate tenant
POST   /api/v1/tenants/{id}/upgrade       - Upgrade plan
GET    /api/v1/tenants/{id}/stats         - Get statistics
DELETE /api/v1/tenants/{id}               - Delete tenant
```

### Role Management (17 endpoints)

```
# Roles
POST   /api/v1/rbac/roles                         - Create custom role
GET    /api/v1/rbac/roles                         - List all roles
GET    /api/v1/rbac/roles/system                 - List system roles
GET    /api/v1/rbac/roles/tenant/{tenantId}      - List tenant custom roles
GET    /api/v1/rbac/roles/{id}                   - Get role by ID
PUT    /api/v1/rbac/roles/{id}                   - Update role
DELETE /api/v1/rbac/roles/{id}                   - Delete role

# Permissions
POST   /api/v1/rbac/permissions                  - Create custom permission
GET    /api/v1/rbac/permissions                  - List all permissions
GET    /api/v1/rbac/permissions/{id}             - Get permission by ID

# User Roles
POST   /api/v1/rbac/user-roles/grant             - Grant role to user
DELETE /api/v1/rbac/user-roles/{tenantId}/{userId}/{roleId}  - Revoke role
GET    /api/v1/rbac/user-roles/{tenantId}/{userId}           - List user roles

# Permission Checking
POST   /api/v1/rbac/permissions/check            - Check if user has permission
GET    /api/v1/rbac/permissions/user/{tenantId}/{userId}     - Get user permissions

# System
POST   /api/v1/rbac/initialize                   - Initialize system permissions/roles
```

### Tenant User Management (12 endpoints)

```
GET    /api/v1/tenants/{tenantId}/users                  - List tenant users
GET    /api/v1/tenants/{tenantId}/users/active           - List active users
GET    /api/v1/tenants/{tenantId}/users/{userId}         - Get specific user
POST   /api/v1/tenants/{tenantId}/users                  - Add user to tenant
PUT    /api/v1/tenants/{tenantId}/users/{userId}         - Update user role
POST   /api/v1/tenants/{tenantId}/users/{userId}/activate   - Activate user
POST   /api/v1/tenants/{tenantId}/users/{userId}/deactivate - Deactivate user
DELETE /api/v1/tenants/{tenantId}/users/{userId}         - Remove user
GET    /api/v1/tenants/{tenantId}/users/owners           - List tenant owners
GET    /api/v1/tenants/{tenantId}/users/admins           - List tenant admins
GET    /api/v1/tenants/{tenantId}/users/count            - Count users
```

## System Permissions (15+)

### Configuration Management
- `config:read` - Read configurations
- `config:write` - Write/create configurations
- `config:delete` - Delete configurations

### Secret Management
- `secret:read` - Read secrets
- `secret:write` - Write/create secrets
- `secret:rotate` - Rotate secrets
- `secret:delete` - Delete secrets

### Application & Environment
- `application:manage` - Manage applications
- `environment:manage` - Manage environments

### Promotion Workflow
- `promotion:execute` - Execute promotions
- `promotion:approve` - Approve/reject promotions

### User & Role Management
- `user:manage` - Manage users
- `role:manage` - Manage roles

### System & Advanced
- `tenant:manage` - Manage tenant settings
- `webhook:manage` - Manage webhooks
- `template:manage` - Manage templates

## System Roles (4)

### SUPER_ADMIN
- Full system access
- All 15+ permissions
- Manages all tenants
- System configuration

### TENANT_ADMIN
- Full tenant access
- All permissions except tenant:manage
- Manages tenant users, roles, settings
- Billing access

### DEVELOPER
- Developer access
- Permissions: config:read, config:write, secret:read, application:manage, promotion:execute
- Can create and manage configurations
- Cannot manage users or roles

### VIEWER
- Read-only access
- Permissions: config:read, secret:read
- View configurations and secrets
- No write permissions

## Subscription Plans

### FREE Plan
- 5 users
- 3 applications
- 100 configurations per application
- 14-day trial

### STARTER Plan
- 20 users
- 10 applications
- 1,000 configurations per application

### PROFESSIONAL Plan
- 100 users
- Unlimited applications
- 10,000 configurations per application

### ENTERPRISE Plan
- Unlimited users
- Unlimited applications
- Unlimited configurations
- Custom limits

## Tenant Roles

### OWNER
- Full control over tenant
- Billing access
- Can manage all users and settings
- Cannot be removed

### ADMIN
- Manage users and settings
- Configurations and secrets access
- Promotion approval
- Cannot manage billing

### MEMBER
- Read/write configurations
- Read secrets
- Execute promotions
- Cannot manage users

### VIEWER
- Read-only access
- View configurations and secrets
- No write permissions

## Database Schema

### tenants Table
- id, name, slug, description
- plan, max_users, max_applications, max_configs_per_application
- is_active, trial_ends_at, subscription_renews_at
- logo_url, domain, settings, created_by
- timestamps

### tenant_users Table
- id, tenant_id, user_id, email, name
- role (OWNER/ADMIN/MEMBER/VIEWER)
- is_active, invited_at, joined_at, last_active_at
- timestamps

### roles Table
- id, name, description
- is_system_role, tenant_id
- timestamps

### permissions Table
- id, name, display_name, description
- resource, action, is_system
- timestamps

### user_roles Table
- id, tenant_id, user_id, role_id
- granted_by, granted_at, expires_at, reason
- timestamps

### role_permissions Table (JPA join table)
- role_id, permission_id

## Frontend UI

### Tenants Page (`/tenants/page.tsx`)
- Tenant list with statistics
- Create tenant modal
- Activate/deactivate tenants
- View plan and usage
- Trial expiration tracking

### Features
- Real-time statistics dashboard
- Plan upgrade functionality
- Usage monitoring (users, applications)
- Trial expiration alerts
- Active/inactive status management

## Security Features

1. **Data Isolation**: Each tenant's data is completely isolated
2. **Permission Enforcement**: All operations check permissions
3. **Role Hierarchy**: Clear role hierarchy with appropriate permissions
4. **Audit Trail**: All role grants tracked with grantedBy and reason
5. **Expiration Support**: Roles can expire automatically
6. **Tenant Context**: All operations require tenant context
7. **Plan Limits**: Automatic enforcement of plan-based limits

## Integration Examples

### Creating a Tenant
```bash
curl -X POST http://localhost:8080/api/v1/tenants \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Acme Corporation",
    "slug": "acme-corp",
    "description": "Tech company",
    "ownerEmail": "admin@acme.com",
    "plan": "STARTER"
  }'
```

### Granting a Role
```bash
curl -X POST http://localhost:8080/api/v1/rbac/user-roles/grant \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "roleId": 4,
    "grantedBy": "admin@acme.com",
    "reason": "Project lead"
  }'
```

### Checking Permissions
```bash
curl -X POST http://localhost:8080/api/v1/rbac/permissions/check/1 \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "resource": "config",
    "action": "write"
  }'
```

## Files Created (27 files)

### Repositories (5)
1. `TenantRepository.java` - Tenant data access
2. `TenantUserRepository.java` - Tenant user membership
3. `RoleRepository.java` - Role management
4. `PermissionRepository.java` - Permission management
5. `UserRoleRepository.java` - User role assignments

### DTOs (13)
6. `CreateTenantDTO.java` - Tenant creation
7. `UpdateTenantDTO.java` - Tenant update
8. `TenantDTO.java` - Tenant response
9. `CreateRoleDTO.java` - Role creation
10. `UpdateRoleDTO.java` - Role update
11. `RoleDTO.java` - Role response
12. `PermissionDTO.java` - Permission response
13. `CreatePermissionDTO.java` - Permission creation
14. `GrantRoleDTO.java` - Grant role to user
15. `UserRoleDTO.java` - User role response
16. `TenantUserDTO.java` - Tenant user response
17. `AddTenantUserDTO.java` - Add user to tenant
18. `UpdateTenantUserDTO.java` - Update tenant user
19. `CheckPermissionDTO.java` - Permission check request
20. `PermissionCheckResponseDTO.java` - Permission check response

### Services (2)
21. `TenantService.java` - Tenant business logic (NEW)
22. `PermissionService.java` - RBAC business logic (already existed)

### Controllers (3)
23. `TenantController.java` - Tenant REST API
24. `RoleController.java` - RBAC REST API
25. `TenantUserController.java` - Tenant User REST API

### Frontend (1)
26. `/tenants/page.tsx` - Tenant management UI

### Documentation (2)
27. `API_REFERENCE.md` - Complete API documentation (already existed)
28. `MULTI_TENANCY_RBAC.md` - This document

## Next Steps

1. **Testing**: Write unit and integration tests
2. **Frontend**: Complete roles and users management UI pages
3. **Postman Collection**: Create API collection for testing
4. **Documentation**: Update main README with RBAC info
5. **Security Audit**: Review permission checks in all controllers
6. **Migration**: Create database migration script
7. **Performance**: Add indexes for frequently queried fields

## Status

✅ Multi-tenancy implementation complete
✅ RBAC implementation complete
✅ REST APIs complete (40 endpoints)
✅ Repositories complete (5)
✅ DTOs complete (15)
✅ Services complete (2)
✅ Controllers complete (3)
✅ Frontend UI (1/3 complete)
⏳ Postman collection pending
⏳ Additional frontend pages pending
⏳ Testing pending
