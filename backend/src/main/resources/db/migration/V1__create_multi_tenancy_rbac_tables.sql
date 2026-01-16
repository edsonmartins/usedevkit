-- =====================================================
-- ConfigHub Multi-Tenancy & RBAC Migration
-- PostgreSQL 15+
-- =====================================================

-- =====================================================
-- TENANTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS tenants (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    domain VARCHAR(255),
    logo_url TEXT,
    description TEXT,
    plan VARCHAR(50) DEFAULT 'FREE',
    max_users INTEGER NOT NULL DEFAULT 5,
    max_applications INTEGER NOT NULL DEFAULT 3,
    max_configs_per_application INTEGER NOT NULL DEFAULT 100,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    subscription_renews_at TIMESTAMP WITH TIME ZONE,
    settings TEXT,
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_plan CHECK (plan IN ('FREE', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE'))
);

-- Indexes for tenants
CREATE INDEX idx_tenants_slug ON tenants(slug);
CREATE INDEX idx_tenants_is_active ON tenants(is_active);
CREATE INDEX idx_tenants_plan ON tenants(plan);

-- =====================================================
-- TENANT_USERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS tenant_users (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    role VARCHAR(50) NOT NULL DEFAULT 'MEMBER',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    invited_by VARCHAR(255),
    invited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    joined_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_tenant_users_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT chk_tenant_role CHECK (role IN ('OWNER', 'ADMIN', 'MEMBER', 'VIEWER')),
    CONSTRAINT uq_tenant_user UNIQUE (tenant_id, user_id)
);

-- Indexes for tenant_users
CREATE INDEX idx_tenant_users_tenant_id ON tenant_users(tenant_id);
CREATE INDEX idx_tenant_users_user_id ON tenant_users(user_id);
CREATE INDEX idx_tenant_users_email ON tenant_users(email);
CREATE INDEX idx_tenant_users_role ON tenant_users(role);
CREATE INDEX idx_tenant_users_is_active ON tenant_users(is_active);

-- =====================================================
-- PERMISSIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS permissions (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    resource VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    is_system BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for permissions
CREATE INDEX idx_permissions_name ON permissions(name);
CREATE INDEX idx_permissions_resource ON permissions(resource);
CREATE INDEX idx_permissions_resource_action ON permissions(resource, action);
CREATE INDEX idx_permissions_is_system ON permissions(is_system);

-- =====================================================
-- ROLES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_system_role BOOLEAN NOT NULL DEFAULT FALSE,
    tenant_id BIGINT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_roles_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT uq_role_tenant_name UNIQUE (name, tenant_id)
);

-- Indexes for roles
CREATE INDEX idx_roles_name ON roles(name);
CREATE INDEX idx_roles_tenant_id ON roles(tenant_id);
CREATE INDEX idx_roles_is_system_role ON roles(is_system_role);

-- =====================================================
-- ROLE_PERMISSIONS (JUNCTION TABLE)
-- =====================================================
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id BIGINT NOT NULL,
    permission_id BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (role_id, permission_id),
    CONSTRAINT fk_role_permissions_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    CONSTRAINT fk_role_permissions_permission FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

-- Indexes for role_permissions
CREATE INDEX idx_role_permissions_permission_id ON role_permissions(permission_id);

-- =====================================================
-- USER_ROLES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS user_roles (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    role_id BIGINT NOT NULL,
    granted_by VARCHAR(255),
    reason TEXT,
    granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_valid BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user_roles_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- Indexes for user_roles
CREATE INDEX idx_user_roles_tenant_id ON user_roles(tenant_id);
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX idx_user_roles_is_valid ON user_roles(is_valid);
CREATE INDEX idx_user_roles_expires_at ON user_roles(expires_at);

-- Composite index for user role queries
CREATE INDEX idx_user_roles_tenant_user_valid ON user_roles(tenant_id, user_id, is_valid);
CREATE INDEX idx_user_roles_tenant_user_valid_expiry ON user_roles(tenant_id, user_id, is_valid, expires_at);

-- =====================================================
-- INSERT SYSTEM PERMISSIONS
-- =====================================================
INSERT INTO permissions (name, display_name, description, resource, action, is_system) VALUES
-- Config permissions
('config:read', 'Read Configurations', 'Can read configuration values', 'config', 'read', TRUE),
('config:write', 'Write Configurations', 'Can create and update configurations', 'config', 'write', TRUE),
('config:delete', 'Delete Configurations', 'Can delete configurations', 'config', 'delete', TRUE),
('config:manage', 'Manage Configurations', 'Full control over configurations', 'config', 'manage', TRUE),

-- Secret permissions
('secret:read', 'Read Secrets', 'Can read secret values', 'secret', 'read', TRUE),
('secret:write', 'Write Secrets', 'Can create and update secrets', 'secret', 'write', TRUE),
('secret:delete', 'Delete Secrets', 'Can delete secrets', 'secret', 'delete', TRUE),
('secret:rotate', 'Rotate Secrets', 'Can rotate secret values', 'secret', 'rotate', TRUE),
('secret:manage', 'Manage Secrets', 'Full control over secrets', 'secret', 'manage', TRUE),

-- Application permissions
('application:read', 'Read Applications', 'Can view applications', 'application', 'read', TRUE),
('application:create', 'Create Applications', 'Can create new applications', 'application', 'create', TRUE),
('application:update', 'Update Applications', 'Can update application details', 'application', 'update', TRUE),
('application:delete', 'Delete Applications', 'Can delete applications', 'application', 'delete', TRUE),
('application:manage', 'Manage Applications', 'Full control over applications', 'application', 'manage', TRUE),

-- Environment permissions
('environment:read', 'Read Environments', 'Can view environments', 'environment', 'read', TRUE),
('environment:create', 'Create Environments', 'Can create new environments', 'environment', 'create', TRUE),
('environment:update', 'Update Environments', 'Can update environment details', 'environment', 'update', TRUE),
('environment:delete', 'Delete Environments', 'Can delete environments', 'environment', 'delete', TRUE),
('environment:manage', 'Manage Environments', 'Full control over environments', 'environment', 'manage', TRUE),

-- Tenant permissions
('tenant:read', 'Read Tenant', 'Can view tenant information', 'tenant', 'read', TRUE),
('tenant:update', 'Update Tenant', 'Can update tenant settings', 'tenant', 'update', TRUE),
('tenant:manage', 'Manage Tenant', 'Full control over tenant', 'tenant', 'manage', TRUE),

-- User management permissions
('user:invite', 'Invite Users', 'Can invite new users', 'user', 'invite', TRUE),
('user:manage', 'Manage Users', 'Can manage user roles and permissions', 'user', 'manage', TRUE),
('user:delete', 'Delete Users', 'Can remove users from tenant', 'user', 'delete', TRUE),

-- Role management permissions
('role:create', 'Create Roles', 'Can create custom roles', 'role', 'create', TRUE),
('role:update', 'Update Roles', 'Can update role details', 'role', 'update', TRUE),
('role:delete', 'Delete Roles', 'Can delete custom roles', 'role', 'delete', TRUE),
('role:manage', 'Manage Roles', 'Full control over roles', 'role', 'manage', TRUE),

-- Feature flag permissions
('featureflag:read', 'Read Feature Flags', 'Can read feature flags', 'featureflag', 'read', TRUE),
('featureflag:write', 'Write Feature Flags', 'Can create and update feature flags', 'featureflag', 'write', TRUE),
('featureflag:delete', 'Delete Feature Flags', 'Can delete feature flags', 'featureflag', 'delete', TRUE),
('featureflag:manage', 'Manage Feature Flags', 'Full control over feature flags', 'featureflag', 'manage', TRUE),

-- Audit permissions
('audit:read', 'Read Audit Logs', 'Can view audit logs', 'audit', 'read', TRUE),

-- Billing permissions
('billing:read', 'Read Billing', 'Can view billing information', 'billing', 'read', TRUE),
('billing:manage', 'Manage Billing', 'Can manage billing and subscriptions', 'billing', 'manage', TRUE)

ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- INSERT SYSTEM ROLES
-- =====================================================
INSERT INTO roles (name, description, is_system_role, tenant_id) VALUES
('SUPER_ADMIN', 'Super Administrator with full system access', TRUE, NULL),
('TENANT_ADMIN', 'Tenant Administrator with full tenant access', TRUE, NULL),
('DEVELOPER', 'Developer with read/write access to configs and secrets', TRUE, NULL),
('VIEWER', 'Viewer with read-only access', TRUE, NULL)

ON CONFLICT (name, tenant_id) DO NOTHING;

-- =====================================================
-- ASSIGN PERMISSIONS TO SYSTEM ROLES
-- =====================================================

-- SUPER_ADMIN: All permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'SUPER_ADMIN'
ON CONFLICT DO NOTHING;

-- TENANT_ADMIN: All except billing
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'TENANT_ADMIN'
  AND p.name NOT LIKE 'billing:%'
ON CONFLICT DO NOTHING;

-- DEVELOPER: Config, Secret, Application, Environment, FeatureFlag (read/write/manage)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'DEVELOPER'
  AND (
    p.resource IN ('config', 'secret', 'application', 'environment', 'featureflag')
    AND p.action IN ('read', 'write', 'create', 'update')
  )
ON CONFLICT DO NOTHING;

-- VIEWER: Read-only access to all resources
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'VIEWER'
  AND p.action = 'read'
ON CONFLICT DO NOTHING;

-- =====================================================
-- FUNCTIONS AND TRIGGERS FOR UPDATED_AT
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all relevant tables
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenant_users_updated_at BEFORE UPDATE ON tenant_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_permissions_updated_at BEFORE UPDATE ON permissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON user_roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to check if user has a specific permission
CREATE OR REPLACE FUNCTION check_user_permission(
    p_tenant_id BIGINT,
    p_user_id VARCHAR,
    p_resource VARCHAR,
    p_action VARCHAR
)
RETURNS BOOLEAN AS $$
DECLARE
    has_permission BOOLEAN := FALSE;
BEGIN
    SELECT EXISTS(
        SELECT 1
        FROM user_roles ur
        JOIN role_permissions rp ON ur.role_id = rp.role_id
        JOIN permissions p ON rp.permission_id = p.id
        WHERE ur.tenant_id = p_tenant_id
          AND ur.user_id = p_user_id
          AND ur.is_valid = TRUE
          AND (ur.expires_at IS NULL OR ur.expires_at > CURRENT_TIMESTAMP)
          AND p.resource = p_resource
          AND (
            p.action = p_action
            OR p.action = 'manage'  -- manage permission includes all actions
          )
    ) INTO has_permission;

    RETURN has_permission;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all user permissions
CREATE OR REPLACE FUNCTION get_user_permissions(
    p_tenant_id BIGINT,
    p_user_id VARCHAR
)
RETURNS TABLE(
    permission_name VARCHAR,
    permission_display VARCHAR,
    resource VARCHAR,
    action VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT
        p.name,
        p.display_name,
        p.resource,
        p.action
    FROM user_roles ur
    JOIN role_permissions rp ON ur.role_id = rp.role_id
    JOIN permissions p ON rp.permission_id = p.id
    WHERE ur.tenant_id = p_tenant_id
      AND ur.user_id = p_user_id
      AND ur.is_valid = TRUE
      AND (ur.expires_at IS NULL OR ur.expires_at > CURRENT_TIMESTAMP)
    ORDER BY p.resource, p.action;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up expired user roles
CREATE OR REPLACE FUNCTION cleanup_expired_user_roles()
RETURNS INT AS $$
DECLARE
    deleted_count INT;
BEGIN
    UPDATE user_roles
    SET is_valid = FALSE
    WHERE is_valid = TRUE
      AND expires_at IS NOT NULL
      AND expires_at < CURRENT_TIMESTAMP;

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- View: Active tenant users with roles
CREATE OR REPLACE VIEW v_active_tenant_users AS
SELECT
    tu.id,
    tu.tenant_id,
    t.name AS tenant_name,
    t.slug AS tenant_slug,
    tu.user_id,
    tu.email,
    tu.name,
    tu.role AS tenant_role,
    COUNT(DISTINCT ur.role_id) AS rbac_roles_count,
    tu.is_active,
    tu.invited_at,
    tu.joined_at
FROM tenant_users tu
JOIN tenants t ON tu.tenant_id = t.id
LEFT JOIN user_roles ur ON ur.tenant_id = tu.tenant_id AND ur.user_id = tu.user_id AND ur.is_valid = TRUE
WHERE tu.is_active = TRUE
GROUP BY tu.id, t.name, t.slug;

-- View: User permissions summary
CREATE OR REPLACE VIEW v_user_permissions_summary AS
SELECT
    ur.tenant_id,
    t.slug AS tenant_slug,
    ur.user_id,
    tu.email,
    r.name AS role_name,
    COUNT(DISTINCT p.id) AS permission_count,
    STRING_AGG(DISTINCT p.resource, ', ') AS resources
FROM user_roles ur
JOIN tenants t ON ur.tenant_id = t.id
JOIN tenant_users tu ON tu.tenant_id = ur.tenant_id AND tu.user_id = ur.user_id
JOIN roles r ON ur.role_id = r.id
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE ur.is_valid = TRUE
  AND (ur.expires_at IS NULL OR ur.expires_at > CURRENT_TIMESTAMP)
GROUP BY ur.tenant_id, t.slug, ur.user_id, tu.email, r.name;

-- View: Tenant statistics
CREATE OR REPLACE VIEW v_tenant_statistics AS
SELECT
    t.id AS tenant_id,
    t.name AS tenant_name,
    t.slug,
    t.plan,
    t.max_users,
    t.max_applications,
    COUNT(DISTINCT tu.user_id) FILTER (WHERE tu.is_active = TRUE) AS current_user_count,
    COUNT(DISTINCT CASE WHEN tu.role = 'OWNER' THEN tu.user_id END) AS owner_count,
    COUNT(DISTINCT CASE WHEN tu.role = 'ADMIN' THEN tu.user_id END) AS admin_count,
    COUNT(DISTINCT CASE WHEN tu.role = 'MEMBER' THEN tu.user_id END) AS member_count,
    COUNT(DISTINCT CASE WHEN tu.role = 'VIEWER' THEN tu.user_id END) AS viewer_count,
    COUNT(DISTINCT r.id) AS custom_roles_count
FROM tenants t
LEFT JOIN tenant_users tu ON t.id = tu.tenant_id
LEFT JOIN roles r ON r.tenant_id = t.id AND r.is_system_role = FALSE
WHERE t.is_active = TRUE
GROUP BY t.id, t.name, t.slug, t.plan, t.max_users, t.max_applications;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE tenants IS 'Stores tenant/organization information for multi-tenancy';
COMMENT ON TABLE tenant_users IS 'Stores user memberships within tenants';
COMMENT ON TABLE permissions IS 'Stores granular permissions following resource:action pattern';
COMMENT ON TABLE roles IS 'Stores system and custom roles with permission aggregations';
COMMENT ON TABLE role_permissions IS 'Junction table linking roles to permissions';
COMMENT ON TABLE user_roles IS 'Stores role assignments to users within tenants';

COMMENT ON FUNCTION check_user_permission IS 'Checks if a user has a specific permission in a tenant';
COMMENT ON FUNCTION get_user_permissions IS 'Returns all permissions for a user in a tenant';
COMMENT ON FUNCTION cleanup_expired_user_roles IS 'Marks expired user roles as invalid';

-- =====================================================
-- END OF MIGRATION
-- =====================================================
