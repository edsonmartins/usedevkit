-- Environments table
CREATE TABLE environments (
    id VARCHAR(255) NOT NULL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description VARCHAR(500),
    application_id VARCHAR(255) NOT NULL,
    color VARCHAR(7),
    inherit_from VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version INTEGER NOT NULL DEFAULT 0,
    UNIQUE (application_id, name),
    FOREIGN KEY (inherit_from) REFERENCES environments(id)
);

CREATE INDEX idx_environments_application_id ON environments(application_id);
CREATE INDEX idx_environments_inherit_from ON environments(inherit_from);
COMMENT ON TABLE environments IS 'Environments (dev, staging, production)';
