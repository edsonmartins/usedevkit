-- Configuration versions table
CREATE TABLE configuration_versions (
    id VARCHAR(255) NOT NULL PRIMARY KEY,
    version_number INTEGER NOT NULL,
    value TEXT NOT NULL,
    change_reason VARCHAR(500),
    changed_by VARCHAR(255),
    configuration_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (configuration_id) REFERENCES configurations(id) ON DELETE CASCADE
);

CREATE INDEX idx_configuration_versions_configuration_id ON configuration_versions(configuration_id);
CREATE INDEX idx_configuration_versions_version_number ON configuration_versions(configuration_id, version_number);
COMMENT ON TABLE configuration_versions IS 'History of configuration changes for rollback';
