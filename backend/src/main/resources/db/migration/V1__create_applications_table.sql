-- Applications table
CREATE TABLE applications (
    id VARCHAR(255) NOT NULL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(500),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    owner_email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_applications_name ON applications(name);
CREATE INDEX idx_applications_owner_email ON applications(owner_email);
CREATE INDEX idx_applications_is_active ON applications(is_active);
COMMENT ON TABLE applications IS 'Represents applications/systems using DevKit';
