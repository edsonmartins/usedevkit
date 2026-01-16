package com.devkit.secrets.domain;

import com.devkit.shared.domain.BaseEntity;
import jakarta.persistence.*;

import java.time.Instant;

/**
 * Represents a Secret Rotation (audit log of all rotations).
 * Tracks the history of all secret rotations with before/after values.
 */
    @Entity
    @Table(name = "secret_rotations")
    public class SecretRotationEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false)
    private String id = java.util.UUID.randomUUID().toString();


    public enum RotationStatus {
        SUCCESS, FAILED, ROLLBACK
    }

    public enum RotationReason {
        MANUAL, AUTOMATIC_SCHEDULED, AUTOMATIC_EXPIRY, SECURITY_INCIDENT
    }

    @Column(name = "secret_id", nullable = false, length = 255)
    private String secretId;

    @Column(name = "secret_key", nullable = false, length = 255)
    private String secretKey;

    @Column(name = "application_id", nullable = false, length = 255)
    private String applicationId;

    @Column(name = "environment_id", length = 255)
    private String environmentId;

    @Column(name = "previous_value", columnDefinition = "TEXT")
    private String previousValue;

    @Column(name = "new_value", columnDefinition = "TEXT")
    private String newValue;

    @Column(name = "previous_version", nullable = false)
    private Integer previousVersion;

    @Column(name = "new_version", nullable = false)
    private Integer newVersion;

    @Column(name = "rotated_by", length = 255)
    private String rotatedBy;

    @Enumerated(EnumType.STRING)
    @Column(name = "rotation_status", length = 20, nullable = false)
    private RotationStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "rotation_reason", length = 30, nullable = false)
    private RotationReason reason;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "rotation_date", nullable = false)
    private Instant rotationDate;

    // Protected no-arg constructor for JPA
    protected SecretRotationEntity() {}

    // Public constructor
    public SecretRotationEntity(
            String secretId,
            String secretKey,
            String applicationId,
            String environmentId,
            String previousValue,
            String newValue,
            Integer previousVersion,
            Integer newVersion,
            String rotatedBy,
            RotationStatus status,
            RotationReason reason,
            String errorMessage) {

        this.secretId = secretId;
        this.secretKey = secretKey;
        this.applicationId = applicationId;
        this.environmentId = environmentId;
        this.previousValue = previousValue;
        this.newValue = newValue;
        this.previousVersion = previousVersion;
        this.newVersion = newVersion;
        this.rotatedBy = rotatedBy;
        this.status = status;
        this.reason = reason;
        this.errorMessage = errorMessage;
        this.rotationDate = Instant.now();
    }

    // Factory method for successful rotation
    public static SecretRotationEntity createSuccess(
            String secretId,
            String secretKey,
            String applicationId,
            String environmentId,
            String previousValue,
            String newValue,
            Integer previousVersion,
            Integer newVersion,
            String rotatedBy,
            RotationReason reason) {

        return new SecretRotationEntity(
                secretId,
                secretKey,
                applicationId,
                environmentId,
                previousValue,
                newValue,
                previousVersion,
                newVersion,
                rotatedBy,
                RotationStatus.SUCCESS,
                reason,
                null
        );
    }

    // Factory method for failed rotation
    public static SecretRotationEntity createFailure(
            String secretId,
            String secretKey,
            String applicationId,
            String environmentId,
            Integer currentVersion,
            String rotatedBy,
            RotationReason reason,
            String errorMessage) {

        return new SecretRotationEntity(
                secretId,
                secretKey,
                applicationId,
                environmentId,
                null,
                null,
                currentVersion,
                currentVersion,
                rotatedBy,
                RotationStatus.FAILED,
                reason,
                errorMessage
        );
    }

    // Getters
    public String getId() {
        return id;
    }

    public String getSecretId() {
        return secretId;
    }

    public String getSecretKey() {
        return secretKey;
    }

    public String getApplicationId() {
        return applicationId;
    }

    public String getEnvironmentId() {
        return environmentId;
    }

    public String getPreviousValue() {
        return previousValue;
    }

    public String getNewValue() {
        return newValue;
    }

    public Integer getPreviousVersion() {
        return previousVersion;
    }

    public Integer getNewVersion() {
        return newVersion;
    }

    public String getRotatedBy() {
        return rotatedBy;
    }

    public RotationStatus getStatus() {
        return status;
    }

    public RotationReason getReason() {
        return reason;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public Instant getRotationDate() {
        return rotationDate;
    }
}
