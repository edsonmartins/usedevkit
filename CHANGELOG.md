# Changelog

All notable changes to DevKit will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added - Multi-Tenancy & RBAC (Fase 2) ✨

#### Multi-Tenancy
- **Tenant Management System**
  - Complete tenant isolation with plan-based limits
  - 4 subscription tiers: FREE, STARTER, PROFESSIONAL, ENTERPRISE
  - Custom domain support per tenant
  - Trial period management
  - Usage statistics and monitoring

- **Tenant User Management**
  - 4 tenant roles: OWNER, ADMIN, MEMBER, VIEWER
  - User invitation and onboarding flow
  - Role-based permissions within tenants
  - User activation/deactivation
  - Audit trail for user management

#### RBAC (Role-Based Access Control)
- **38+ Granular Permissions**
  - Config permissions (read, write, delete, manage)
  - Secret permissions (read, write, delete, rotate, manage)
  - Application permissions (read, create, update, delete, manage)
  - Environment permissions (read, create, update, delete, manage)
  - Feature flag permissions (read, write, delete, manage)
  - Role management permissions
  - User management permissions
  - Audit and billing permissions

- **Role System**
  - 4 system roles: SUPER_ADMIN, TENANT_ADMIN, DEVELOPER, VIEWER
  - Custom tenant-specific roles
  - Permission inheritance
  - Time-based role assignments with expiration
  - Role hierarchy support

#### Backend Implementation (32 Files)
- **Entities (4)**
  - `TenantEntity` - Organization/tenant data
  - `TenantUserEntity` - User memberships
  - `RoleEntity` - Roles with permissions
  - `PermissionEntity` - Granular permissions
  - `UserRoleEntity` - User role assignments

- **Repositories (5)**
  - `TenantRepository`, `TenantUserRepository`
  - `RoleRepository`, `PermissionRepository`, `UserRoleRepository`

- **DTOs (13)**
  - Tenant DTOs (Create, Update, View)
  - Role DTOs (Create, Update, View)
  - Permission DTOs
  - User Role DTOs
  - Permission Check DTOs

- **Services (2)**
  - `TenantService` - Tenant business logic
  - `PermissionService` - Permission checking

- **REST Controllers (3)**
  - `TenantController` - 11 endpoints
  - `TenantUserController` - 12 endpoints
  - `RoleController` - 17 endpoints
  - **Total: 40 REST API endpoints**

#### Frontend Implementation (3 Pages)
- `/tenants/page.tsx`
  - Tenant dashboard with statistics
  - Create/edit/delete tenants
  - Plan upgrade functionality
  - Usage monitoring
  - Trial status tracking

- `/roles/page.tsx`
  - Role management interface
  - Permission assignment
  - System vs custom roles
  - Permission reference guide

- `/users/page.tsx`
  - User management per tenant
  - Role assignment
  - User activation/deactivation
  - Bulk operations

#### Database (2 Migration Scripts)
- **V1__create_multi_tenancy_rbac_tables.sql** (500+ lines)
  - 6 main tables
  - 38 system permissions
  - 4 system roles with pre-configured permissions
  - Views, functions, and triggers
  - Helper functions for permission checking

- **V2__add_tenant_id_to_existing_tables.sql**
  - Add tenant_id columns to 15 existing tables
  - Performance indexes
  - Data migration guidelines

#### Documentation (4 Files)
- `API_REFERENCE.md` - Complete API documentation with 100+ endpoints
- `MULTI_TENANCY_RBAC.md` - Architecture and implementation details
- `TENANT_ID_IMPLEMENTATION_GUIDE.md` - Hibernate 6 @TenantId guide
- `ConfigHub_MultiTenancy_RBAC.postman_collection.json` - Postman collection

### Changed
- Updated `ConfigurationEntity` to include `tenant_id` field
- Updated `ApplicationEntity` to include `tenant_id` field
- Updated `RoleEntity` to include `tenant_id` field

### Security
- Row-level security with tenant_id filtering
- Permission-based access control on all operations
- Audit trail for all permission changes
- Time-based access control support

---

## [1.0.0] - 2024-01-XX

### Added - Core Features (Fase 1)

#### Configuration Management
- Centralized configuration storage
- Multi-environment support (dev, staging, prod)
- Configuration versioning
- Type validation (STRING, INTEGER, BOOLEAN, JSON, DOUBLE, SECRET)
- Hot reload without restart

#### Secrets Management
- AES-256-GCM encryption at rest
- Secure secret storage
- Secret rotation tracking
- Encryption key management

#### Feature Flags
- Dynamic feature toggling
- Environment-specific flags
- Rollout strategies
- A/B testing support

#### Backend
- Spring Boot 3.2 application
- PostgreSQL 15 database
- REST API with 40+ endpoints
- JWT authentication
- Audit logging

#### Frontend
- Next.js 16 dashboard
- React 19 components
- Modern UI with Tailwind CSS
- Responsive design

#### SDKs
- Java SDK (Planned)
- TypeScript SDK (Planned)
- Flutter SDK (Planned)

#### CLI Tool
- Rust-based CLI (Planned)
- Configuration management
- Secret operations
- Feature flag controls

### Infrastructure
- Docker Compose setup
- Kubernetes manifests (Planned)
- Database migrations with Flyway
- Health check endpoints

---

## [Upcoming] - Future Releases

### [1.1.0] - Planned
- [ ] Complete SDK implementations
- [ ] CLI tool release
- [ ] Integration tests
- [ ] Performance optimizations
- [ ] Extended documentation

### [1.2.0] - Planned
- [ ] LDAP/SSO integration
- [ ] OAuth2/OIDC providers
- [ ] Advanced audit reporting
- [ ] Webhook notifications
- [ ] Import/export functionality

### [2.0.0] - Planned
- [ ] Terraform provider
- [ ] Kubernetes Operator
- [ ] Mobile apps (iOS, Android)
- [ ] Multi-region support
- [ ] Advanced analytics

---

## Contributors

- [@edsonmartins](https://github.com/edsonmartins) - Project Lead

## License

This changelog is part of DevKit and is licensed under the MIT License.
