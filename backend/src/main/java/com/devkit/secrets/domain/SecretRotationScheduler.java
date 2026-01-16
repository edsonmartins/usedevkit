package com.devkit.secrets.domain;

import com.devkit.secrets.domain.events.SecretRotatedEvent;
import com.devkit.secrets.domain.vo.SecretId;
import com.devkit.shared.domain.SpringEventPublisher;
import com.devkit.shared.security.EncryptionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service for automatic secret rotation.
 * This service should be called periodically by a scheduler (e.g., cron job).
 */
@Service
@Transactional
public class SecretRotationScheduler {

    private static final Logger logger = LoggerFactory.getLogger(SecretRotationScheduler.class);

    private final SecretRepository secretRepository;
    private final SecretRotationRepository rotationRepository;
    private final EncryptionService encryptionService;
    private final SpringEventPublisher eventPublisher;

    SecretRotationScheduler(
            SecretRepository secretRepository,
            SecretRotationRepository rotationRepository,
            EncryptionService encryptionService,
            SpringEventPublisher eventPublisher) {
        this.secretRepository = secretRepository;
        this.rotationRepository = rotationRepository;
        this.encryptionService = encryptionService;
        this.eventPublisher = eventPublisher;
    }

    /**
     * Rotate all secrets that need rotation based on their policy.
     * This method should be called periodically (e.g., daily).
     *
     * @return Number of secrets rotated
     */
    @Scheduled(cron = "0 0 2 * * *")
    public int rotateDueSecrets() {
        logger.info("Starting automatic secret rotation check...");

        List<SecretEntity> needsRotation = secretRepository.findSecretsNeedingRotation();

        logger.info("Found {} secrets that need rotation", needsRotation.size());

        int rotatedCount = 0;
        int failedCount = 0;

        for (SecretEntity secret : needsRotation) {
            try {
                rotateSecret(secret);
                rotatedCount++;
            } catch (Exception e) {
                logger.error("Failed to rotate secret: {}", secret.getKey(), e);
                recordFailure(secret, e.getMessage());
                failedCount++;
            }
        }

        logger.info("Automatic rotation completed: {} rotated, {} failed", rotatedCount, failedCount);
        return rotatedCount;
    }

    /**
     * Rotate secrets for a specific application.
     */
    public int rotateApplicationSecrets(String applicationId) {
        logger.info("Starting rotation check for application: {}", applicationId);

        List<SecretEntity> appSecrets = secretRepository.findByApplicationId(applicationId);

        List<SecretEntity> needsRotation = appSecrets.stream()
            .filter(SecretEntity::isActive)
            .filter(SecretEntity::needsRotation)
            .toList();

        logger.info("Found {} secrets for application {} that need rotation", needsRotation.size(), applicationId);

        int rotatedCount = 0;
        for (SecretEntity secret : needsRotation) {
            try {
                rotateSecret(secret);
                rotatedCount++;
            } catch (Exception e) {
                logger.error("Failed to rotate secret: {}", secret.getKey(), e);
                recordFailure(secret, e.getMessage());
            }
        }

        return rotatedCount;
    }

    /**
     * Manually trigger rotation for a specific secret.
     */
    public void rotateSecretNow(String secretId, String rotatedBy) {
        SecretEntity secret = secretRepository.findById(SecretId.of(secretId))
            .orElseThrow(() -> new IllegalArgumentException("Secret not found: " + secretId));

        rotateSecret(secret, rotatedBy, SecretRotationEntity.RotationReason.MANUAL);
    }

    /**
     * Rotate a single secret with automatic value generation.
     */
    private void rotateSecret(SecretEntity secret) {
        String rotatedBy = "SYSTEM_SCHEDULER";
        SecretRotationEntity.RotationReason reason = determineRotationReason(secret);

        rotateSecret(secret, rotatedBy, reason);
    }

    /**
     * Rotate a specific secret with a specific reason.
     */
    private void rotateSecret(
            SecretEntity secret,
            String rotatedBy,
            SecretRotationEntity.RotationReason reason) {

        logger.info("Rotating secret: {} for application: {}", secret.getKey(), secret.getApplicationId());

        // Generate new encrypted value
        String previousValue = secret.getEncryptedValue();
        Integer previousVersion = secret.getVersionNumber();

        // For automatic rotation, we generate a new value
        // In production, this would integrate with external secret managers (AWS, Azure, etc.)
        String newValue = generateNewSecretValue(secret);
        String newEncryptedValue = encryptionService.encrypt(newValue);

        // Rotate the secret
        secret.rotate(newEncryptedValue, rotatedBy);
        secretRepository.save(secret);

        // Record successful rotation
        var rotationHistory = SecretRotationEntity.createSuccess(
            secret.getId().id(),
            secret.getKey(),
            secret.getApplicationId(),
            secret.getEnvironmentId(),
            previousValue,
            newEncryptedValue,
            previousVersion,
            secret.getVersionNumber(),
            rotatedBy,
            reason
        );
        rotationRepository.save(rotationHistory);

        // Publish event
        eventPublisher.publish(new SecretRotatedEvent(
            secret.getId().id(),
            secret.getKey(),
            rotatedBy,
            secret.getVersionNumber(),
            secret.getApplicationId(),
            secret.getEnvironmentId()
        ));

        logger.info("Successfully rotated secret: {}", secret.getKey());
    }

    /**
     * Record a failed rotation attempt.
     */
    private void recordFailure(SecretEntity secret, String errorMessage) {
        var failureHistory = SecretRotationEntity.createFailure(
            secret.getId().id(),
            secret.getKey(),
            secret.getApplicationId(),
            secret.getEnvironmentId(),
            secret.getVersionNumber(),
            "SYSTEM_SCHEDULER",
            SecretRotationEntity.RotationReason.AUTOMATIC_SCHEDULED,
            errorMessage
        );
        rotationRepository.save(failureHistory);
    }

    /**
     * Generate a new secret value.
     * In production, this would integrate with external secret managers.
     */
    private String generateNewSecretValue(SecretEntity secret) {
        // For now, generate a random password
        // In production, integrate with AWS Secrets Manager, HashiCorp Vault, etc.
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
        StringBuilder password = new StringBuilder();

        for (int i = 0; i < 32; i++) {
            int index = (int) (Math.random() * chars.length());
            password.append(chars.charAt(index));
        }

        return password.toString();
    }

    /**
     * Determine the rotation reason based on the secret's policy and state.
     */
    private SecretRotationEntity.RotationReason determineRotationReason(SecretEntity secret) {
        if (secret.getRotationPolicy() == SecretEntity.RotationPolicy.MANUAL) {
            return SecretRotationEntity.RotationReason.MANUAL;
        }

        // Check if it's past due date
        if (secret.getNextRotationDate() != null && secret.needsRotation()) {
            return SecretRotationEntity.RotationReason.AUTOMATIC_EXPIRY;
        }

        return SecretRotationEntity.RotationReason.AUTOMATIC_SCHEDULED;
    }
}
