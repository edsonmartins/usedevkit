-- Insert seed data for testing

-- Insert test application
INSERT INTO applications (id, name, description, owner_email, is_active)
VALUES (
    'test-app-001',
    'VendaX AI',
    'AI-powered e-commerce recommendations platform',
    'admin@vendax.ai',
    TRUE
);

-- Insert test API key
INSERT INTO api_keys (id, key_hash, key_prefix, name, expires_at, application_id)
VALUES (
    'apikey-001',
    '$2a$10$abcdefghijklmnopqrstuvwxyz123456', -- Mock hash
    'dk_test_',
    'Production API Key',
    CURRENT_TIMESTAMP + INTERVAL '365 days',
    'test-app-001'
);

-- Insert test environments
INSERT INTO environments (id, name, description, application_id, color)
VALUES
    ('env-001', 'development', 'Development environment', 'test-app-001', '#6366f1'),
    ('env-002', 'staging', 'Staging environment', 'test-app-001', '#f59e0b'),
    ('env-003', 'production', 'Production environment', 'test-app-001', '#10b981');

-- Insert test feature flags
INSERT INTO feature_flags (id, key, name, description, status, rollout_strategy, rollout_percentage, application_id)
VALUES
    ('flag-001', 'ai-recommendations', 'AI Recommendations', 'Enable AI-powered product recommendations', 'ENABLED', 'ALL', NULL, 'test-app-001'),
    ('flag-002', 'ai-model-test', 'AI Model A/B Test', 'Test GPT-4 vs Claude 3 for recommendations', 'CONDITIONAL', 'PERCENTAGE', 50, 'test-app-001'),
    ('flag-003', 'new-checkout-flow', 'New Checkout Flow', 'Gradual rollout of new checkout experience', 'DISABLED', 'GRADUAL', 25, 'test-app-001');

-- Insert test feature flag variants
INSERT INTO feature_flag_variants (id, key, name, description, rollout_percentage, is_control, feature_flag_id)
VALUES
    ('variant-001', 'gpt4', 'GPT-4', 'OpenAI GPT-4 model', 50, TRUE, 'flag-002'),
    ('variant-002', 'claude3', 'Claude 3', 'Anthropic Claude 3 model', 50, FALSE, 'flag-002');
