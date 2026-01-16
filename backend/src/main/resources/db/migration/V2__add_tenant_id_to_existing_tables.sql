-- =====================================================
-- Add Tenant Support to Existing Tables
-- PostgreSQL 15+
-- =====================================================

-- This migration adds tenant_id columns to existing tables
-- to enable proper multi-tenancy isolation

-- =====================================================
-- APPLICATIONS TABLE
-- =====================================================
ALTER TABLE applications
ADD COLUMN IF NOT EXISTS tenant_id BIGINT;

CREATE INDEX IF NOT EXISTS idx_applications_tenant_id ON applications(tenant_id);

COMMENT ON COLUMN applications.tenant_id IS 'Foreign key reference to tenants for multi-tenancy';

-- =====================================================
-- ENVIRONMENTS TABLE
-- =====================================================
ALTER TABLE environments
ADD COLUMN IF NOT EXISTS tenant_id BIGINT;

CREATE INDEX IF NOT EXISTS idx_environments_tenant_id ON environments(tenant_id);

COMMENT ON COLUMN environments.tenant_id IS 'Foreign key reference to tenants for multi-tenancy';

-- =====================================================
-- CONFIGURATIONS TABLE
-- =====================================================
ALTER TABLE configurations
ADD COLUMN IF NOT EXISTS tenant_id BIGINT;

CREATE INDEX IF NOT EXISTS idx_configurations_tenant_id ON configurations(tenant_id);

COMMENT ON COLUMN configurations.tenant_id IS 'Foreign key reference to tenants for multi-tenancy';

-- =====================================================
-- SECRETS TABLE
-- =====================================================
ALTER TABLE secrets
ADD COLUMN IF NOT EXISTS tenant_id BIGINT;

CREATE INDEX IF NOT EXISTS idx_secrets_tenant_id ON secrets(tenant_id);

COMMENT ON COLUMN secrets.tenant_id IS 'Foreign key reference to tenants for multi-tenancy';

-- =====================================================
-- FEATURE_FLAGS TABLE
-- =====================================================
ALTER TABLE feature_flags
ADD COLUMN IF NOT EXISTS tenant_id BIGINT;

CREATE INDEX IF NOT EXISTS idx_feature_flags_tenant_id ON feature_flags(tenant_id);

COMMENT ON COLUMN feature_flags.tenant_id IS 'Foreign key reference to tenants for multi-tenancy';

-- =====================================================
-- FEATURE_FLAG_VARIANTS TABLE
-- =====================================================
ALTER TABLE feature_flag_variants
ADD COLUMN IF NOT EXISTS tenant_id BIGINT;

CREATE INDEX IF NOT EXISTS idx_feature_flag_variants_tenant_id ON feature_flag_variants(tenant_id);

COMMENT ON COLUMN feature_flag_variants.tenant_id IS 'Foreign key reference to tenants for multi-tenancy';

-- =====================================================
-- WEBHOOKS TABLE
-- =====================================================
ALTER TABLE webhooks
ADD COLUMN IF NOT EXISTS tenant_id BIGINT;

CREATE INDEX IF NOT EXISTS idx_webhooks_tenant_id ON webhooks(tenant_id);

COMMENT ON COLUMN webhooks.tenant_id IS 'Foreign key reference to tenants for multi-tenancy';

-- =====================================================
-- WEBHOOK_DELIVERIES TABLE
-- =====================================================
ALTER TABLE webhook_deliveries
ADD COLUMN IF NOT EXISTS tenant_id BIGINT;

CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_tenant_id ON webhook_deliveries(tenant_id);

COMMENT ON COLUMN webhook_deliveries.tenant_id IS 'Foreign key reference to tenants for multi-tenancy';

-- =====================================================
-- SERVICES TABLE
-- =====================================================
ALTER TABLE services
ADD COLUMN IF NOT EXISTS tenant_id BIGINT;

CREATE INDEX IF NOT EXISTS idx_services_tenant_id ON services(tenant_id);

COMMENT ON COLUMN services.tenant_id IS 'Foreign key reference to tenants for multi-tenancy';

-- =====================================================
-- SERVICE_DEPENDENCIES TABLE
-- =====================================================
ALTER TABLE service_dependencies
ADD COLUMN IF NOT EXISTS tenant_id BIGINT;

CREATE INDEX IF NOT EXISTS idx_service_dependencies_tenant_id ON service_dependencies(tenant_id);

COMMENT ON COLUMN service_dependencies.tenant_id IS 'Foreign key reference to tenants for multi-tenancy';

-- =====================================================
-- TEMPLATES TABLE
-- =====================================================
ALTER TABLE templates
ADD COLUMN IF NOT EXISTS tenant_id BIGINT;

CREATE INDEX IF NOT EXISTS idx_templates_tenant_id ON templates(tenant_id);

COMMENT ON COLUMN templates.tenant_id IS 'Foreign key reference to tenants for multi-tenancy';

-- =====================================================
-- TEMPLATE_VERSIONS TABLE
-- =====================================================
ALTER TABLE template_versions
ADD COLUMN IF NOT EXISTS tenant_id BIGINT;

CREATE INDEX IF NOT EXISTS idx_template_versions_tenant_id ON template_versions(tenant_id);

COMMENT ON COLUMN template_versions.tenant_id IS 'Foreign key reference to tenants for multi-tenancy';

-- =====================================================
-- APPLICATION_API_KEYS TABLE
-- =====================================================
ALTER TABLE application_api_keys
ADD COLUMN IF NOT EXISTS tenant_id BIGINT;

CREATE INDEX IF NOT EXISTS idx_application_api_keys_tenant_id ON application_api_keys(tenant_id);

COMMENT ON COLUMN application_api_keys.tenant_id IS 'Foreign key reference to tenants for multi-tenancy';

-- =====================================================
-- CONFIGURATION_VERSIONS TABLE
-- =====================================================
ALTER TABLE configuration_versions
ADD COLUMN IF NOT EXISTS tenant_id BIGINT;

CREATE INDEX IF NOT EXISTS idx_configuration_versions_tenant_id ON configuration_versions(tenant_id);

COMMENT ON COLUMN configuration_versions.tenant_id IS 'Foreign key reference to tenants for multi-tenancy';

-- =====================================================
-- SECRET_ROTATIONS TABLE
-- =====================================================
ALTER TABLE secret_rotations
ADD COLUMN IF NOT EXISTS tenant_id BIGINT;

CREATE INDEX IF NOT EXISTS idx_secret_rotations_tenant_id ON secret_rotations(tenant_id);

COMMENT ON COLUMN secret_rotations.tenant_id IS 'Foreign key reference to tenants for multi-tenancy';

-- =====================================================
-- DATA MIGRATION NOTES
-- =====================================================
-- After adding tenant_id columns, you may need to migrate existing data:

-- 1. Assign existing applications/environments to a default tenant:
-- UPDATE applications SET tenant_id = 1 WHERE tenant_id IS NULL;
-- UPDATE environments SET tenant_id = 1 WHERE tenant_id IS NULL;

-- 2. For child tables, inherit tenant_id from parent:
-- UPDATE configurations c
-- SET tenant_id = (
--   SELECT e.tenant_id
--   FROM environments e
--   WHERE e.id = c.environment_id
-- )
-- WHERE c.tenant_id IS NULL;

-- UPDATE secrets s
-- SET tenant_id = (
--   SELECT e.tenant_id
--   FROM environments e
--   WHERE e.id = s.environment_id
-- )
-- WHERE s.tenant_id IS NULL;

-- 3. Make tenant_id NOT NULL after data migration:
-- ALTER TABLE applications ALTER COLUMN tenant_id SET NOT NULL;
-- ALTER TABLE environments ALTER COLUMN tenant_id SET NOT NULL;
-- etc.

-- =====================================================
-- HIBERNATE 6 TENANT SUPPORT
-- =====================================================
-- For Hibernate 6 multi-tenancy with @TenantId:
-- 1. Add @TenantId annotation to entity fields
-- 2. Configure Hibernate MultiTenancyStrategy
-- 3. Implement CurrentTenantIdentifierResolver

-- Example entity field:
-- @TenantId
-- @Column(name = "tenant_id")
-- private Long tenantId;

-- =====================================================
-- END OF MIGRATION
-- =====================================================
