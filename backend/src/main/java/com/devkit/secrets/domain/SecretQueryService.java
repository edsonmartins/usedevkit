package com.devkit.secrets.domain;

import com.devkit.shared.domain.ResourceNotFoundException;
import com.devkit.shared.security.EncryptionService;
import com.devkit.secrets.domain.vo.SecretId;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Query Service for Secret read operations.
 */
@Service
@Transactional(readOnly = true)
public class SecretQueryService {

    private final SecretRepository secretRepository;
    private final EncryptionService encryptionService;

    SecretQueryService(
            SecretRepository secretRepository,
            EncryptionService encryptionService) {
        this.secretRepository = secretRepository;
        this.encryptionService = encryptionService;
    }

    /**
     * Get all active secrets for an application.
     * @param applicationId the application ID
     * @return list of secret results (without decrypted values)
     */
    public List<SecretResult> getSecretsByApplication(String applicationId) {
        return secretRepository.findActiveByApplicationId(applicationId)
                .stream()
                .map(SecretResult::from)
                .collect(Collectors.toList());
    }

    /**
     * Get secrets by application and environment.
     * @param applicationId the application ID
     * @param environmentId the environment ID (optional)
     * @return list of secret results (without decrypted values)
     */
    public List<SecretResult> getSecretsByApplicationAndEnvironment(String applicationId, String environmentId) {
        return secretRepository.findActiveByApplicationIdAndEnvironmentId(applicationId, environmentId)
                .stream()
                .map(SecretResult::from)
                .collect(Collectors.toList());
    }

    /**
     * Get secret by ID (without decrypted value).
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
     * Get secret by ID with decrypted value.
     * @param secretId the secret ID
     * @return the secret result with decrypted value
     */
    public SecretResultWithDecrypted getSecretWithDecryptedValue(String secretId) {
        var secret = secretRepository.findById(SecretId.of(secretId))
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Secret not found with id: " + secretId));

        String decryptedValue = encryptionService.decrypt(secret.getEncryptedValue());
        return SecretResultWithDecrypted.from(secret, decryptedValue);
    }

    /**
     * Get secret by application and key (without decrypted value).
     * @param applicationId the application ID
     * @param key the secret key
     * @return the secret result
     */
    public SecretResult getSecretByApplicationAndKey(String applicationId, String key) {
        var secret = secretRepository.getByApplicationIdAndKey(applicationId, key);
        return SecretResult.from(secret);
    }

    /**
     * Get secret by application and key with decrypted value.
     * @param applicationId the application ID
     * @param key the secret key
     * @return the secret result with decrypted value
     */
    public SecretResultWithDecrypted getSecretWithDecryptedValueByApplicationAndKey(String applicationId, String key) {
        var secret = secretRepository.getByApplicationIdAndKey(applicationId, key);
        String decryptedValue = encryptionService.decrypt(secret.getEncryptedValue());
        return SecretResultWithDecrypted.from(secret, decryptedValue);
    }

    /**
     * Get secrets as a map (for SDK consumption).
     * @param applicationId the application ID
     * @param environmentId the environment ID
     * @return map of secret key to decrypted value
     */
    public Map<String, String> getSecretMap(String applicationId, String environmentId) {
        return secretRepository.findActiveByApplicationIdAndEnvironmentId(applicationId, environmentId)
                .stream()
                .collect(Collectors.toMap(
                        SecretEntity::getKey,
                        s -> encryptionService.decrypt(s.getEncryptedValue())
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
