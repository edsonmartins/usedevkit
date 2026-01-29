package com.devkit.secrets.integrations;

import com.devkit.secrets.domain.SecretEntity;
import org.springframework.stereotype.Service;

/**
 * No-op external secret manager used when integrations are disabled.
 */
@Service
public class NoopSecretExternalManager implements SecretExternalManager {

    @Override
    public void upsertSecret(SecretEntity secret, String plaintextValue, String description) {
        // No-op
    }

    @Override
    public void deleteSecret(SecretEntity secret) {
        // No-op
    }
}
