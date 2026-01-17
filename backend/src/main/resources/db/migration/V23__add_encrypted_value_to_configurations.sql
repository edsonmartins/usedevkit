-- Add encrypted_value column to configurations table
-- This allows storing sensitive configurations encrypted with the app's key

ALTER TABLE configurations
ADD COLUMN encrypted_value TEXT;

-- Add comment
COMMENT ON COLUMN configurations.encrypted_value IS 'Encrypted value using application-specific key (when is_secret=true)';

-- For existing secret configurations, we need to migrate them
-- This will be done by a separate migration script or application logic
-- Marking that migration is needed
-- DO NOT RUN THIS IN PRODUCTION WITHOUT BACKUP AND PROPER MIGRATION STRATEGY
