package com.devkit.applications.domain;

import com.devkit.shared.domain.ResourceNotFoundException;
import com.devkit.shared.security.EncryptionService;
import com.devkit.shared.security.EncryptionException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

/**
 * Service for managing application encryption keys.
 * Handles creation, rotation, and retrieval of per-application encryption keys.
 */
@Service
@Transactional
public class EncryptionKeyService {

    private final ApplicationEncryptionKeyRepository encryptionKeyRepository;
    private final ApplicationRepository applicationRepository;
    private final EncryptionService encryptionService;

    EncryptionKeyService(
            ApplicationEncryptionKeyRepository encryptionKeyRepository,
            ApplicationRepository applicationRepository,
            EncryptionService encryptionService) {
        this.encryptionKeyRepository = encryptionKeyRepository;
        this.applicationRepository = applicationRepository;
        this.encryptionService = encryptionService;
    }

    /**
     * Create a new encryption key for an application.
     * Deactivates any existing active keys for the application.
     *
     * @param applicationId the application ID
     * @param plaintextKey the encryption key (or null to auto-generate)
     * @param createdBy the user email for audit
     * @return the created encryption key info including the plaintext key (shown only once)
     * @throws ResourceNotFoundException if application not found
     */
    public EncryptionKeyResult createEncryptionKey(String applicationId, String plaintextKey, String createdBy) {
        applicationRepository.findById(
                        com.devkit.applications.domain.vo.ApplicationId.of(applicationId))
                .orElseThrow(() -> new ResourceNotFoundException("Application not found: " + applicationId));

        encryptionKeyRepository.findActiveByApplicationId(applicationId)
                .forEach(key -> key.deactivate());

        if (plaintextKey == null || plaintextKey.isBlank()) {
            plaintextKey = EncryptionService.generateApplicationKey();
        }

        if (plaintextKey.length() < 32) {
            throw new IllegalArgumentException("Encryption key must be at least 32 characters");
        }

        byte[] salt = encryptionService.generateSalt();
        String keyHash = encryptionService.hashApplicationKey(plaintextKey);
        byte[] wrappedKey = encryptionService.wrapApplicationKey(plaintextKey);

        ApplicationEncryptionKeyEntity keyEntity = ApplicationEncryptionKeyEntity.create(
                applicationId,
                wrappedKey,
                keyHash,
                salt
        );

        encryptionKeyRepository.save(keyEntity);

        return new EncryptionKeyResult(
                keyEntity.getId().id(),
                applicationId,
                keyHash,
                keyEntity.getKeyVersion(),
                true,
                null,
                null,
                keyEntity.getCreatedAt(),
                keyEntity.getUpdatedAt(),
                plaintextKey
        );
    }

    public EncryptionKeyResult getEncryptionKey(String applicationId) {
        ApplicationEncryptionKeyEntity keyEntity = encryptionKeyRepository.getLatestActiveByApplicationId(applicationId);

        return new EncryptionKeyResult(
                keyEntity.getId().id(),
                applicationId,
                keyEntity.getKeyHash(),
                keyEntity.getKeyVersion(),
                keyEntity.isActive(),
                keyEntity.getLastRotatedAt(),
                keyEntity.getRotatedBy(),
                keyEntity.getCreatedAt(),
                keyEntity.getUpdatedAt(),
                null
        );
    }

    /**
     * Rotate an application's encryption key.
     * WARNING: Existing data encrypted with the old key will NOT be automatically re-encrypted.
     * A separate data migration process is required to re-encrypt secrets and configurations.
     *
     * @param applicationId the application ID
     * @param newPlaintextKey the new encryption key (or null to auto-generate)
     * @param rotatedBy the user email for audit
     * @return the updated encryption key info
     * @throws ResourceNotFoundException if application or key not found
     */
    public EncryptionKeyResult rotateEncryptionKey(String applicationId, String newPlaintextKey, String rotatedBy) {
        applicationRepository.findById(
                        com.devkit.applications.domain.vo.ApplicationId.of(applicationId))
                .orElseThrow(() -> new ResourceNotFoundException("Application not found: " + applicationId));

        ApplicationEncryptionKeyEntity existingKey = encryptionKeyRepository.getLatestActiveByApplicationId(applicationId);

        if (newPlaintextKey == null || newPlaintextKey.isBlank()) {
            newPlaintextKey = EncryptionService.generateApplicationKey();
        }

        if (newPlaintextKey.length() < 32) {
            throw new IllegalArgumentException("Encryption key must be at least 32 characters");
        }

        byte[] newSalt = encryptionService.generateSalt();
        String newKeyHash = encryptionService.hashApplicationKey(newPlaintextKey);
        byte[] newWrappedKey = encryptionService.wrapApplicationKey(newPlaintextKey);

        existingKey.rotate(newWrappedKey, newKeyHash, rotatedBy);
        existingKey.setSaltDirectly(newSalt);

        encryptionKeyRepository.save(existingKey);

        return new EncryptionKeyResult(
                existingKey.getId().id(),
                applicationId,
                newKeyHash,
                existingKey.getKeyVersion(),
                true,
                Instant.now(),
                rotatedBy,
                existingKey.getCreatedAt(),
                existingKey.getUpdatedAt(),
                newPlaintextKey
        );
    }

    public void deleteEncryptionKey(String applicationId) {
        ApplicationEncryptionKeyEntity keyEntity = encryptionKeyRepository.getLatestActiveByApplicationId(applicationId);
        keyEntity.deactivate();
        encryptionKeyRepository.save(keyEntity);
    }

    public boolean hasActiveEncryptionKey(String applicationId) {
        return encryptionKeyRepository.hasActiveEncryptionKey(applicationId);
    }

    public boolean verifyKeyHash(String applicationId, String providedKeyHash) {
        return encryptionKeyRepository.findLatestActiveByApplicationId(applicationId)
                .map(key -> key.isKeyMatch(providedKeyHash))
                .orElse(false);
    }

    /**
     * Result record for encryption key operations.
     */
    public record EncryptionKeyResult(
            String id,
            String applicationId,
            String keyHash,
            Integer keyVersion,
            Boolean isActive,
            Instant lastRotatedAt,
            String rotatedBy,
            Instant createdAt,
            Instant updatedAt,
            String plaintextKey // Only populated during creation/rotation
    ) {}
}
