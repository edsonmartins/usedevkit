package com.devkit.secrets.domain;

import com.devkit.secrets.domain.vo.SecretId;
import com.devkit.shared.domain.AssertUtil;
import com.devkit.shared.domain.BaseEntity;
import jakarta.persistence.*;

import java.time.Instant;

/**
 * Represents a Secret (sensitive information like API keys, passwords, tokens).
 * Secrets are encrypted at rest using AES-256-GCM.
 */
@Entity
@Table(name = "secrets", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"application_id", "key"})
})
public class SecretEntity extends BaseEntity {

    public enum RotationPolicy {
        MANUAL, AUTOMATIC_30_DAYS, AUTOMATIC_60_DAYS, AUTOMATIC_90_DAYS
    }

    @EmbeddedId
    @AttributeOverride(name = "id", column = @Column(name = "id", nullable = false))
    private SecretId id;

    @Column(name = "key", nullable = false, length = 255)
    private String key;

    @Column(name = "encrypted_value", nullable = false, columnDefinition = "TEXT")
    private String encryptedValue;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "application_id", nullable = false, length = 255)
    private String applicationId;

    @Column(name = "environment_id", length = 255)
    private String environmentId;

    @Enumerated(EnumType.STRING)
    @Column(name = "rotation_policy", length = 30)
    private RotationPolicy rotationPolicy;

    @Column(name = "last_rotation_date")
    private Instant lastRotationDate;

    @Column(name = "next_rotation_date")
    private Instant nextRotationDate;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive;

    @Column(name = "secret_version", nullable = false)
    private Integer versionNumber;

    @Version
    private int version;

    // Protected no-arg constructor for JPA
    protected SecretEntity() {}

    // Public constructor
    public SecretEntity(
            SecretId id,
            String key,
            String encryptedValue,
            String description,
            String applicationId,
            String environmentId,
            RotationPolicy rotationPolicy) {

        this.id = AssertUtil.requireNotNull(id, "Secret id cannot be null");
        this.key = AssertUtil.requireNotBlank(key, "Secret key cannot be null or empty");
        this.encryptedValue = AssertUtil.requireNotNull(encryptedValue, "Encrypted value cannot be null");
        this.description = description;
        this.applicationId = AssertUtil.requireNotBlank(applicationId, "Application id cannot be null or empty");
        this.environmentId = environmentId;
        this.rotationPolicy = rotationPolicy != null ? rotationPolicy : RotationPolicy.MANUAL;
        this.isActive = true;
        this.versionNumber = 1;
    }

    // Factory method
    public static SecretEntity create(
            String key,
            String encryptedValue,
            String description,
            String applicationId,
            String environmentId,
            RotationPolicy rotationPolicy) {

        return new SecretEntity(
                SecretId.generate(),
                key,
                encryptedValue,
                description,
                applicationId,
                environmentId,
                rotationPolicy
        );
    }

    // Domain methods
    public void rotate(String newEncryptedValue, String rotatedBy) {
        this.encryptedValue = AssertUtil.requireNotNull(newEncryptedValue, "New encrypted value cannot be null");
        this.lastRotationDate = Instant.now();
        this.versionNumber++;
        calculateNextRotationDate();
    }

    public void updateDetails(
            String encryptedValue,
            String description,
            RotationPolicy rotationPolicy,
            String applicationId,
            String environmentId) {
        if (encryptedValue != null) {
            this.encryptedValue = encryptedValue;
        }

        if (description != null) {
            this.description = description;
        }

        if (rotationPolicy != null) {
            this.rotationPolicy = rotationPolicy;
            calculateNextRotationDate();
        }

        if (applicationId != null) {
            this.applicationId = applicationId;
        }

        if (environmentId != null) {
            this.environmentId = environmentId;
        }
    }

    public void deactivate() {
        this.isActive = false;
    }

    public boolean needsRotation() {
        return nextRotationDate != null && Instant.now().isAfter(nextRotationDate);
    }

    private void calculateNextRotationDate() {
        if (rotationPolicy == RotationPolicy.MANUAL) {
            this.nextRotationDate = null;
            return;
        }

        long days = switch (rotationPolicy) {
            case AUTOMATIC_30_DAYS -> 30;
            case AUTOMATIC_60_DAYS -> 60;
            case AUTOMATIC_90_DAYS -> 90;
            default -> 0;
        };

        if (days > 0) {
            this.nextRotationDate = Instant.now().plusSeconds(days * 24 * 60 * 60);
        }
    }

    // Getters
    public SecretId getId() {
        return id;
    }

    public String getKey() {
        return key;
    }

    public String getEncryptedValue() {
        return encryptedValue;
    }

    public String getDescription() {
        return description;
    }

    public String getApplicationId() {
        return applicationId;
    }

    public String getEnvironmentId() {
        return environmentId;
    }

    public RotationPolicy getRotationPolicy() {
        return rotationPolicy;
    }

    public Instant getLastRotationDate() {
        return lastRotationDate;
    }

    public Instant getNextRotationDate() {
        return nextRotationDate;
    }

    public Boolean isActive() {
        return isActive;
    }

    public Integer getVersionNumber() {
        return versionNumber;
    }

    public int getVersion() {
        return version;
    }
}
