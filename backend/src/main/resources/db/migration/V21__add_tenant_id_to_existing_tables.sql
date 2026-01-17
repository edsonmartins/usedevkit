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
-- API_KEYS TABLE
-- =====================================================
ALTER TABLE api_keys
ADD COLUMN IF NOT EXISTS tenant_id BIGINT;

CREATE INDEX IF NOT EXISTS idx_api_keys_tenant_id ON api_keys(tenant_id);

COMMENT ON COLUMN api_keys.tenant_id IS 'Foreign key reference to tenants for multi-tenancy';

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
-- CONFIGURATION_VERSIONS TABLE
-- =====================================================
ALTER TABLE configuration_versions
ADD COLUMN IF NOT EXISTS tenant_id BIGINT;

CREATE INDEX IF NOT EXISTS idx_configuration_versions_tenant_id ON configuration_versions(tenant_id);

COMMENT ON COLUMN configuration_versions.tenant_id IS 'Foreign key reference to tenants for multi-tenancy';

-- =====================================================
-- AUDIT_LOGS TABLE
-- =====================================================
ALTER TABLE audit_logs
ADD COLUMN IF NOT EXISTS tenant_id BIGINT;

CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_id ON audit_logs(tenant_id);

COMMENT ON COLUMN audit_logs.tenant_id IS 'Foreign key reference to tenants for multi-tenancy';

-- =====================================================
-- END OF MIGRATION
-- =====================================================
