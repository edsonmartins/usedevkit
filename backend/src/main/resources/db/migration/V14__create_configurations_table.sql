-- Configurations table
CREATE TABLE configurations (
    id VARCHAR(255) NOT NULL PRIMARY KEY,
    key VARCHAR(255) NOT NULL,
    value TEXT NOT NULL,
    type VARCHAR(20) NOT NULL,
    description VARCHAR(500),
    is_secret BOOLEAN NOT NULL DEFAULT FALSE,
    environment_id VARCHAR(255) NOT NULL,
    version_number INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version INTEGER NOT NULL DEFAULT 0,
    UNIQUE (environment_id, key)
);

CREATE INDEX idx_configurations_environment_id ON configurations(environment_id);
CREATE INDEX idx_configurations_is_secret ON configurations(is_secret);
COMMENT ON TABLE configurations IS 'Configuration key-value pairs';
COMMENT ON COLUMN configurations.type IS 'STRING, INTEGER, BOOLEAN, JSON, DOUBLE, SECRET';
