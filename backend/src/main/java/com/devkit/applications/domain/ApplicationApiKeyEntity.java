package com.devkit.applications.domain;

import com.devkit.applications.domain.vo.ApplicationId;
import com.devkit.auth.domain.vo.ApiKeyId;
import com.devkit.shared.domain.AssertUtil;
import com.devkit.shared.domain.BaseEntity;
import jakarta.persistence.*;

import java.time.Instant;

/**
 * Represents an API Key associated with an Application.
 * API keys are used for authentication and authorization of client applications.
 */
@Entity
@Table(name = "api_keys")
public class ApplicationApiKeyEntity extends BaseEntity {

    @EmbeddedId
    @AttributeOverride(name = "id", column = @Column(name = "id", nullable = false))
    private ApiKeyId id;

    @Column(name = "key_hash", nullable = false, unique = true, length = 255)
    private String keyHash;

    @Column(name = "key_prefix", nullable = false, length = 10)
    private String keyPrefix;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "last_used_at")
    private Instant lastUsedAt;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    private ApplicationEntity application;

    @Version
    private int version;

    // Protected no-arg constructor for JPA
    protected ApplicationApiKeyEntity() {}

    // Public constructor with all required fields
    public ApplicationApiKeyEntity(
            ApiKeyId id,
            String keyHash,
            String keyPrefix,
            String name,
            Instant expiresAt,
            ApplicationEntity application) {

        this.id = AssertUtil.requireNotNull(id, "API Key id cannot be null");
        this.keyHash = AssertUtil.requireNotBlank(keyHash, "Key hash cannot be null or empty");
        this.keyPrefix = AssertUtil.requireNotBlank(keyPrefix, "Key prefix cannot be null or empty");
        this.name = AssertUtil.requireNotBlank(name, "API Key name cannot be null or empty");
        this.expiresAt = AssertUtil.requireNotNull(expiresAt, "Expiration date cannot be null");
        this.application = AssertUtil.requireNotNull(application, "Application cannot be null");
        this.isActive = true;
    }

    // Factory method
    public static ApplicationApiKeyEntity create(
            String keyHash,
            String keyPrefix,
            String name,
            Instant expiresAt,
            ApplicationEntity application) {

        return new ApplicationApiKeyEntity(
                ApiKeyId.generate(),
                keyHash,
                keyPrefix,
                name,
                expiresAt,
                application
        );
    }

    // Domain methods
    public void deactivate() {
        this.isActive = false;
    }

    public boolean isActive() {
        return this.isActive && !isExpired();
    }

    public boolean isExpired() {
        return Instant.now().isAfter(expiresAt);
    }

    public void updateLastUsed() {
        this.lastUsedAt = Instant.now();
    }

    // Getters
    public ApiKeyId getId() {
        return id;
    }

    public String getKeyHash() {
        return keyHash;
    }

    public String getKeyPrefix() {
        return keyPrefix;
    }

    public String getName() {
        return name;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public Instant getLastUsedAt() {
        return lastUsedAt;
    }

    public ApplicationEntity getApplication() {
        return application;
    }

    public int getVersion() {
        return version;
    }
}
