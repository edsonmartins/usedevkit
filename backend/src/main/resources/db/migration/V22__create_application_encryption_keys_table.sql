-- Application Encryption Keys table
-- Stores per-application encryption keys for compartmentalized security
-- Keys are wrapped (encrypted) using the master key
CREATE TABLE application_encryption_keys (
    id VARCHAR(255) NOT NULL PRIMARY KEY,
    application_id VARCHAR(255) NOT NULL,
    encrypted_key BYTEA NOT NULL,
    key_hash VARCHAR(64) NOT NULL,
    salt BYTEA NOT NULL,
    key_version INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_rotated_at TIMESTAMP WITH TIME ZONE,
    rotated_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
);

CREATE INDEX idx_application_encryption_keys_application_id ON application_encryption_keys(application_id);
CREATE INDEX idx_application_encryption_keys_is_active ON application_encryption_keys(is_active);
CREATE INDEX idx_application_encryption_keys_key_hash ON application_encryption_keys(key_hash);

-- Ensure only one active key per application at a time
CREATE UNIQUE INDEX idx_application_encryption_keys_active_key
    ON application_encryption_keys(application_id)
    WHERE is_active = TRUE;

COMMENT ON TABLE application_encryption_keys IS 'Per-application encryption keys for compartmentalized security';
COMMENT ON COLUMN application_encryption_keys.encrypted_key IS 'Application key encrypted with master key (AES-256-GCM)';
COMMENT ON COLUMN application_encryption_keys.key_hash IS 'SHA-256 hash of plaintext key for verification';
COMMENT ON COLUMN application_encryption_keys.salt IS 'Salt for PBKDF2 key derivation (16 bytes)';
COMMENT ON COLUMN application_encryption_keys.key_version IS 'Key version for rotation support';
