-- Audit logs table
CREATE TABLE audit_logs (
    id VARCHAR(255) NOT NULL PRIMARY KEY,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(255) NOT NULL,
    action VARCHAR(50) NOT NULL,
    actor VARCHAR(255),
    ip_address VARCHAR(45),
    user_agent TEXT,
    success BOOLEAN NOT NULL DEFAULT TRUE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
COMMENT ON TABLE audit_logs IS 'Immutable audit log for all operations';
COMMENT ON COLUMN audit_logs.action IS 'CREATE, UPDATE, DELETE, ENABLE, DISABLE, ROTATE';
