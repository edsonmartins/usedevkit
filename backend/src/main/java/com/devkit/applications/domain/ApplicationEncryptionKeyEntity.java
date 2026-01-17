package com.devkit.applications.domain;

import com.devkit.applications.domain.vo.ApplicationKeyId;
import com.devkit.shared.domain.AssertUtil;
import com.devkit.shared.domain.BaseEntity;
import jakarta.persistence.*;

import java.security.SecureRandom;
import java.util.Base64;

/**
 * Represents an encryption key for an Application.
 * Each application can have its own encryption key for compartmentalized security.
 * The key is stored encrypted (wrapped) using the master key.
 */
@Entity
@Table(name = "application_encryption_keys")
public class ApplicationEncryptionKeyEntity extends BaseEntity {

    @EmbeddedId
    @AttributeOverride(name = "id", column = @Column(name = "id", nullable = false))
    private ApplicationKeyId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false, insertable = false, updatable = false)
    private ApplicationEntity application;

    @Column(name = "application_id", nullable = false, length = 255)
    private String applicationId;

    @Column(name = "encrypted_key", nullable = false, columnDefinition = "BLOB")
    private byte[] encryptedKey;

    @Column(name = "key_hash", nullable = false, length = 64)
    private String keyHash;

    @Column(name = "salt", nullable = false, columnDefinition = "BLOB")
    private byte[] salt;

    @Column(name = "key_version", nullable = false)
    private Integer keyVersion;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive;

    @Column(name = "last_rotated_at")
    private java.time.Instant lastRotatedAt;

    @Column(name = "rotated_by", length = 255)
    private String rotatedBy;

    @Version
    private int version;

    // Protected no-arg constructor for JPA
    protected ApplicationEncryptionKeyEntity() {}

    // Public constructor
    public ApplicationEncryptionKeyEntity(
            ApplicationKeyId id,
            String applicationId,
            byte[] encryptedKey,
            String keyHash,
            byte[] salt) {

        this.id = AssertUtil.requireNotNull(id, "Encryption key id cannot be null");
        this.applicationId = AssertUtil.requireNotBlank(applicationId, "Application id cannot be null or empty");
        this.encryptedKey = AssertUtil.requireNotNull(encryptedKey, "Encrypted key cannot be null");
        this.keyHash = AssertUtil.requireNotBlank(keyHash, "Key hash cannot be null or empty");
        this.salt = AssertUtil.requireNotNull(salt, "Salt cannot be null");
        this.keyVersion = 1;
        this.isActive = true;
    }

    /**
     * Factory method to create a new encryption key for an application.
     * Generates a random 256-bit key and returns the plaintext key for one-time display.
     *
     * @param applicationId the application ID
     * @param encryptedKey the encrypted key bytes (wrapped with master key)
     * @param keyHash the SHA-256 hash of the plaintext key (for verification)
     * @param salt the salt used for key derivation
     * @return a new ApplicationEncryptionKeyEntity
     */
    public static ApplicationEncryptionKeyEntity create(
            String applicationId,
            byte[] encryptedKey,
            String keyHash,
            byte[] salt) {

        return new ApplicationEncryptionKeyEntity(
                ApplicationKeyId.generate(),
                applicationId,
                encryptedKey,
                keyHash,
                salt
        );
    }

    /**
     * Generates a random application encryption key (256 bits).
     * This key should be shown to the user ONCE during creation.
     *
     * @return Base64-encoded 256-bit key
     */
    public static String generateApplicationKey() {
        SecureRandom random = new SecureRandom();
        byte[] keyBytes = new byte[32]; // 256 bits
        random.nextBytes(keyBytes);
        return Base64.getEncoder().encodeToString(keyBytes);
    }

    /**
     * Generates a random salt for key derivation.
     *
     * @return 16-byte random salt
     */
    public static byte[] generateSalt() {
        SecureRandom random = new SecureRandom();
        byte[] salt = new byte[16];
        random.nextBytes(salt);
        return salt;
    }

    // Domain methods
    public void deactivate() {
        this.isActive = false;
    }

    public void rotate(byte[] newEncryptedKey, String newKeyHash, String rotatedBy) {
        this.encryptedKey = AssertUtil.requireNotNull(newEncryptedKey, "New encrypted key cannot be null");
        this.keyHash = AssertUtil.requireNotBlank(newKeyHash, "New key hash cannot be null or empty");
        this.keyVersion++;
        this.lastRotatedAt = java.time.Instant.now();
        this.rotatedBy = rotatedBy;
    }

    public boolean isKeyMatch(String providedKeyHash) {
        return this.keyHash.equals(providedKeyHash);
    }

    // Getters
    public ApplicationKeyId getId() {
        return id;
    }

    public String getApplicationId() {
        return applicationId;
    }

    public byte[] getEncryptedKey() {
        return encryptedKey;
    }

    public String getKeyHash() {
        return keyHash;
    }

    public byte[] getSalt() {
        return salt;
    }

    public Integer getKeyVersion() {
        return keyVersion;
    }

    public Boolean isActive() {
        return isActive;
    }

    public java.time.Instant getLastRotatedAt() {
        return lastRotatedAt;
    }

    public String getRotatedBy() {
        return rotatedBy;
    }

    public int getEntityVersion() {
        return version;
    }

    public ApplicationEntity getApplication() {
        return application;
    }

    public void setApplication(ApplicationEntity application) {
        this.application = application;
    }

    /**
     * Package-private method to update salt during rotation.
     * Used by EncryptionKeyService.
     */
    void setSaltDirectly(byte[] newSalt) {
        this.salt = newSalt;
    }
}
