-- Feature flags table
CREATE TABLE feature_flags (
    id VARCHAR(255) NOT NULL PRIMARY KEY,
    key VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL,
    rollout_strategy VARCHAR(30) NOT NULL,
    rollout_percentage INTEGER,
    targeting_rules TEXT,
    application_id VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version INTEGER NOT NULL DEFAULT 0,
    UNIQUE (application_id, key)
);

CREATE INDEX idx_feature_flags_application_id ON feature_flags(application_id);
CREATE INDEX idx_feature_flags_is_active ON feature_flags(is_active);
CREATE INDEX idx_feature_flags_status ON feature_flags(status);
COMMENT ON TABLE feature_flags IS 'Feature flags for gradual rollout and A/B testing';
COMMENT ON COLUMN feature_flags.status IS 'ENABLED, DISABLED, CONDITIONAL';
COMMENT ON COLUMN feature_flags.rollout_strategy IS 'ALL, PERCENTAGE, USER_SEGMENT, GRADUAL, TARGETING_RULES';
