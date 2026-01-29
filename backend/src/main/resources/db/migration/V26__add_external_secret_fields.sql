ALTER TABLE secrets
    ADD COLUMN external_provider VARCHAR(50),
    ADD COLUMN external_secret_name VARCHAR(255);

CREATE INDEX idx_secrets_external_provider ON secrets(external_provider);
