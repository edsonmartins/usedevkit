-- Secrets table
CREATE TABLE secrets (
    id VARCHAR(255) NOT NULL PRIMARY KEY,
    key VARCHAR(255) NOT NULL,
    encrypted_value TEXT NOT NULL,
    description VARCHAR(500),
    application_id VARCHAR(255) NOT NULL,
    environment_id VARCHAR(255),
    rotation_policy VARCHAR(30),
    last_rotation_date TIMESTAMP WITH TIME ZONE,
    next_rotation_date TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version INTEGER NOT NULL DEFAULT 0,
    UNIQUE (application_id, key)
);

CREATE INDEX idx_secrets_application_id ON secrets(application_id);
CREATE INDEX idx_secrets_is_active ON secrets(is_active);
CREATE INDEX idx_secrets_next_rotation_date ON secrets(next_rotation_date);
COMMENT ON TABLE secrets IS 'Encrypted secrets (API keys, passwords, tokens)';
COMMENT ON COLUMN secrets.rotation_policy IS 'MANUAL, AUTOMATIC_30_DAYS, AUTOMATIC_60_DAYS, AUTOMATIC_90_DAYS';
