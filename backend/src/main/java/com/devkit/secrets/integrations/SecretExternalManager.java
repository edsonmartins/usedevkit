package com.devkit.secrets.integrations;

import com.devkit.secrets.domain.SecretEntity;

/**
 * Integrates secrets with external secret managers.
 */
public interface SecretExternalManager {

    void upsertSecret(SecretEntity secret, String plaintextValue, String description);

    void deleteSecret(SecretEntity secret);
}
