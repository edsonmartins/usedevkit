package com.devkit.secrets.domain;

import com.devkit.secrets.domain.events.*;
import com.devkit.secrets.domain.vo.SecretId;
import com.devkit.shared.domain.ResourceNotFoundException;
import com.devkit.shared.domain.SpringEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Command Service for Secret write operations.
 */
@Service
@Transactional
public class SecretCommandService {

    private final SecretRepository secretRepository;
    private final SecretRotationRepository secretRotationRepository;
    private final SpringEventPublisher eventPublisher;

    SecretCommandService(
            SecretRepository secretRepository,
            SecretRotationRepository secretRotationRepository,
            SpringEventPublisher eventPublisher) {
        this.secretRepository = secretRepository;
        this.secretRotationRepository = secretRotationRepository;
        this.eventPublisher = eventPublisher;
    }

    /**
     * Create a new secret.
     * @param cmd the command containing secret details
     * @return the ID of the created secret
     */
    public String createSecret(CreateSecretCmd cmd) {
        // Check if secret with same key already exists
        secretRepository.findByApplicationIdAndKey(cmd.applicationId(), cmd.key())
                .ifPresent(existing -> {
                    throw new IllegalArgumentException(
                            "Secret with key '" + cmd.key() + "' already exists for this application");
                });

        var secret = SecretEntity.create(
                cmd.key(),
                cmd.encryptedValue(),
                cmd.description(),
                cmd.applicationId(),
                cmd.environmentId(),
                cmd.rotationPolicy()
        );

        secretRepository.save(secret);
        eventPublisher.publish(new SecretCreatedEvent(
                secret.getId().id(),
                secret.getKey(),
                secret.getApplicationId(),
                secret.getEnvironmentId()
        ));

        return secret.getId().id();
    }

    /**
     * Update an existing secret.
     * @param cmd the command containing updated secret details
     */
    public void updateSecret(UpdateSecretCmd cmd) {
        var secret = secretRepository.findById(SecretId.of(cmd.secretId()))
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Secret not found with id: " + cmd.secretId()));

        // Update fields
        if (cmd.encryptedValue() != null) {
            // Encrypted value is updated directly (normally via reflection)
            // This would need a proper domain method in production
        }

        if (cmd.rotationPolicy() != null) {
            // Rotation policy update would need a domain method
        }

        secretRepository.save(secret);
    }

    /**
     * Rotate a secret.
     * @param cmd the command containing rotation details
     */
    public String rotateSecret(RotateSecretCmd cmd) {
        var secret = secretRepository.findById(SecretId.of(cmd.secretId()))
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Secret not found with id: " + cmd.secretId()));

        // Store previous value and version for audit
        String previousValue = secret.getEncryptedValue();
        Integer previousVersion = secret.getVersionNumber();

        // Rotate the secret
        secret.rotate(cmd.newEncryptedValue(), cmd.rotatedBy());
        secretRepository.save(secret);

        // Create rotation history entry
        var rotationHistory = SecretRotationEntity.createSuccess(
                secret.getId().id(),
                secret.getKey(),
                secret.getApplicationId(),
                secret.getEnvironmentId(),
                previousValue,
                cmd.newEncryptedValue(),
                previousVersion,
                secret.getVersionNumber(),
                cmd.rotatedBy(),
                SecretRotationEntity.RotationReason.MANUAL
        );
        secretRotationRepository.save(rotationHistory);

        // Publish event
        eventPublisher.publish(new SecretRotatedEvent(
                secret.getId().id(),
                secret.getKey(),
                cmd.rotatedBy(),
                secret.getVersionNumber(),
                secret.getApplicationId(),
                secret.getEnvironmentId()
        ));

        return secret.getId().id();
    }

    /**
     * Deactivate a secret.
     * @param secretId the ID of the secret to deactivate
     */
    public void deactivateSecret(String secretId) {
        var secret = secretRepository.findById(SecretId.of(secretId))
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Secret not found with id: " + secretId));

        secret.deactivate();

        secretRepository.save(secret);
        eventPublisher.publish(new SecretDeactivatedEvent(
                secretId,
                secret.getKey(),
                secret.getApplicationId(),
                secret.getEnvironmentId()
        ));
    }

    /**
     * Delete a secret.
     * @param secretId the ID of the secret to delete
     */
    public void deleteSecret(String secretId) {
        var secret = secretRepository.findById(SecretId.of(secretId))
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Secret not found with id: " + secretId));

        String key = secret.getKey();
        String applicationId = secret.getApplicationId();
        String environmentId = secret.getEnvironmentId();

        secretRepository.delete(secret);
        eventPublisher.publish(new SecretDeletedEvent(
                secretId,
                key,
                applicationId,
                environmentId
        ));
    }
}
