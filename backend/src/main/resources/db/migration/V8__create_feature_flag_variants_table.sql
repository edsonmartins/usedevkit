-- Feature flag variants table
CREATE TABLE feature_flag_variants (
    id VARCHAR(255) NOT NULL PRIMARY KEY,
    key VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    rollout_percentage INTEGER NOT NULL,
    payload TEXT,
    is_control BOOLEAN NOT NULL DEFAULT FALSE,
    feature_flag_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (feature_flag_id) REFERENCES feature_flags(id) ON DELETE CASCADE
);

CREATE INDEX idx_feature_flag_variants_feature_flag_id ON feature_flag_variants(feature_flag_id);
COMMENT ON TABLE feature_flag_variants IS 'Variants for A/B testing feature flags';
