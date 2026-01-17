package com.devkit.secrets.domain;

import com.devkit.shared.domain.ResourceNotFoundException;
import com.devkit.secrets.domain.vo.SecretId;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Query Service for Secret read operations.
 * Secrets are returned encrypted - SDKs must decrypt using the application's encryption key.
 */
@Service
@Transactional(readOnly = true)
public class SecretQueryService {

    private final SecretRepository secretRepository;

    SecretQueryService(SecretRepository secretRepository) {
        this.secretRepository = secretRepository;
    }

    /**
     * Get all active secrets for an application.
     * @param applicationId the application ID
     * @return list of secret results (with encrypted values)
     */
    public List<SecretResult> getSecretsByApplication(String applicationId) {
        return secretRepository.findActiveByApplicationId(applicationId)
                .stream()
                .map(SecretResult::from)
                .collect(Collectors.toList());
    }

    /**
     * Get all active secrets.
     * @return list of secret results (with encrypted values)
     */
    public List<SecretResult> getAllActiveSecrets() {
        return secretRepository.findByIsActiveTrue()
                .stream()
                .map(SecretResult::from)
                .collect(Collectors.toList());
    }

    /**
     * Get secrets by application and environment.
     * @param applicationId the application ID
     * @param environmentId the environment ID (optional)
     * @return list of secret results (with encrypted values)
     */
    public List<SecretResult> getSecretsByApplicationAndEnvironment(String applicationId, String environmentId) {
        return secretRepository.findActiveByApplicationIdAndEnvironmentId(applicationId, environmentId)
                .stream()
                .map(SecretResult::from)
                .collect(Collectors.toList());
    }

    /**
     * Get secret by ID (with encrypted value).
     * @param secretId the secret ID
     * @return the secret result
     */
    public SecretResult getSecretById(String secretId) {
        return secretRepository.findById(SecretId.of(secretId))
                .map(SecretResult::from)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Secret not found with id: " + secretId));
    }

    /**
     * Get secret by application and key (with encrypted value).
     * @param applicationId the application ID
     * @param key the secret key
     * @return the secret result
     */
    public SecretResult getSecretByApplicationAndKey(String applicationId, String key) {
        var secret = secretRepository.getByApplicationIdAndKey(applicationId, key);
        return SecretResult.from(secret);
    }

    /**
     * Get secrets as a map (for SDK consumption).
     * Returns encrypted values that SDKs must decrypt using the application's encryption key.
     *
     * @param applicationId the application ID
     * @param environmentId the environment ID
     * @return map of secret key to encrypted value
     */
    public Map<String, String> getSecretMap(String applicationId, String environmentId) {
        return secretRepository.findActiveByApplicationIdAndEnvironmentId(applicationId, environmentId)
                .stream()
                .collect(Collectors.toMap(
                        SecretEntity::getKey,
                        SecretEntity::getEncryptedValue
                ));
    }

    /**
     * Get secrets needing rotation.
     * @return list of secrets that need rotation
     */
    public List<SecretResult> getSecretsNeedingRotation() {
        return secretRepository.findSecretsNeedingRotation(java.time.Instant.now())
                .stream()
                .map(SecretResult::from)
                .collect(Collectors.toList());
    }
}
