package com.devkit.secrets.domain;

import com.devkit.applications.domain.ApplicationEncryptionKeyRepository;
import com.devkit.secrets.domain.events.*;
import com.devkit.secrets.domain.vo.SecretId;
import com.devkit.secrets.integrations.SecretExternalManager;
import com.devkit.shared.domain.ResourceNotFoundException;
import com.devkit.shared.domain.SpringEventPublisher;
import com.devkit.shared.security.EncryptionService;
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
    private final ApplicationEncryptionKeyRepository encryptionKeyRepository;
    private final EncryptionService encryptionService;
    private final SecretExternalManager externalManager;

    SecretCommandService(
            SecretRepository secretRepository,
            SecretRotationRepository secretRotationRepository,
            SpringEventPublisher eventPublisher,
            ApplicationEncryptionKeyRepository encryptionKeyRepository,
            EncryptionService encryptionService,
            SecretExternalManager externalManager) {
        this.secretRepository = secretRepository;
        this.secretRotationRepository = secretRotationRepository;
        this.eventPublisher = eventPublisher;
        this.encryptionKeyRepository = encryptionKeyRepository;
        this.encryptionService = encryptionService;
        this.externalManager = externalManager;
    }

    public String createSecret(CreateSecretCmd cmd) {
        secretRepository.findByApplicationIdAndKey(cmd.applicationId(), cmd.key())
                .ifPresent(existing -> {
                    throw new IllegalArgumentException(
                            "Secret with key '" + cmd.key() + "' already exists for this application");
                });

        String encryptedValue = encryptSecretValue(cmd.applicationId(), cmd.value());

        var secret = SecretEntity.create(
                cmd.key(),
                encryptedValue,
                cmd.description(),
                cmd.applicationId(),
                cmd.environmentId(),
                cmd.externalProvider(),
                cmd.externalSecretName(),
                cmd.rotationPolicy()
        );

        secretRepository.save(secret);
        externalManager.upsertSecret(secret, cmd.value(), cmd.description());
        eventPublisher.publish(new SecretCreatedEvent(
                secret.getId().id(),
                secret.getKey(),
                secret.getApplicationId(),
                secret.getEnvironmentId()
        ));

        return secret.getId().id();
    }

    public void updateSecret(UpdateSecretCmd cmd) {
        var secret = secretRepository.findById(SecretId.of(cmd.secretId()))
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Secret not found with id: " + cmd.secretId()));

        String encryptedValue = cmd.value() != null
                ? encryptSecretValue(secret.getApplicationId(), cmd.value())
                : null;

        secret.updateDetails(
            encryptedValue,
            cmd.description(),
            cmd.rotationPolicy(),
            cmd.applicationId(),
            cmd.environmentId(),
            cmd.externalProvider(),
            cmd.externalSecretName()
        );
        secretRepository.save(secret);
        if (cmd.value() != null) {
            externalManager.upsertSecret(secret, cmd.value(), cmd.description());
        }
    }

    public String rotateSecret(RotateSecretCmd cmd) {
        var secret = secretRepository.findById(SecretId.of(cmd.secretId()))
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Secret not found with id: " + cmd.secretId()));

        String previousValue = secret.getEncryptedValue();
        Integer previousVersion = secret.getVersionNumber();
        try {
            externalManager.upsertSecret(secret, cmd.newValue(), secret.getDescription());
        } catch (Exception e) {
            var failureHistory = SecretRotationEntity.createFailure(
                secret.getId().id(),
                secret.getKey(),
                secret.getApplicationId(),
                secret.getEnvironmentId(),
                secret.getVersionNumber(),
                cmd.rotatedBy(),
                SecretRotationEntity.RotationReason.MANUAL,
                e.getMessage()
            );
            secretRotationRepository.save(failureHistory);
            eventPublisher.publish(new SecretRotationFailedEvent(
                secret.getId().id(),
                secret.getKey(),
                cmd.rotatedBy(),
                secret.getVersionNumber(),
                secret.getApplicationId(),
                secret.getEnvironmentId(),
                e.getMessage()
            ));
            throw e;
        }
        String newEncryptedValue = encryptSecretValue(secret.getApplicationId(), cmd.newValue());

        secret.rotate(newEncryptedValue, cmd.rotatedBy());
        secretRepository.save(secret);

        var rotationHistory = SecretRotationEntity.createSuccess(
                secret.getId().id(),
                secret.getKey(),
                secret.getApplicationId(),
                secret.getEnvironmentId(),
                previousValue,
                newEncryptedValue,
                previousVersion,
                secret.getVersionNumber(),
                cmd.rotatedBy(),
                SecretRotationEntity.RotationReason.MANUAL
        );
        secretRotationRepository.save(rotationHistory);

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

    private String encryptSecretValue(String applicationId, String plaintextValue) {
        var encryptionKey = encryptionKeyRepository.findLatestActiveByApplicationId(applicationId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Application encryption key not found. Please create an encryption key for this application first."));

        String applicationKey = encryptionService.unwrapApplicationKey(encryptionKey.getEncryptedKey());
        return encryptionService.encryptForApp(
                plaintextValue,
                applicationKey,
                encryptionKey.getSalt()
        );
    }

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

    public void deleteSecret(String secretId) {
        var secret = secretRepository.findById(SecretId.of(secretId))
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Secret not found with id: " + secretId));

        String key = secret.getKey();
        String applicationId = secret.getApplicationId();
        String environmentId = secret.getEnvironmentId();

        externalManager.deleteSecret(secret);
        secretRepository.delete(secret);
        eventPublisher.publish(new SecretDeletedEvent(
                secretId,
                key,
                applicationId,
                environmentId
        ));
    }
}
