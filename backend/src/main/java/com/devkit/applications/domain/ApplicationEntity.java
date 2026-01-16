package com.devkit.applications.domain;

import com.devkit.applications.domain.vo.ApplicationId;
import com.devkit.shared.domain.AssertUtil;
import com.devkit.shared.domain.BaseEntity;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

/**
 * Represents an Application in the DevKit system.
 * An Application is a logical grouping of configurations, secrets, and feature flags
 * for a specific system or service (e.g., VendaX, Mentors).
 *
 * This is the aggregate root for the Application bounded context.
 */
@Entity
@Table(name = "applications")
public class ApplicationEntity extends BaseEntity {

    @EmbeddedId
    @AttributeOverride(name = "id", column = @Column(name = "id", nullable = false))
    private ApplicationId id;

    @Column(name = "name", nullable = false, unique = true, length = 100)
    private String name;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive;

    @Column(name = "owner_email", length = 255)
    private String ownerEmail;

    @Column(name = "tenant_id")
    private Long tenantId;

    @OneToMany(mappedBy = "application", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ApplicationApiKeyEntity> apiKeys = new ArrayList<>();

    @Version
    private int version;

    // Protected no-arg constructor for JPA
    protected ApplicationEntity() {}

    // Public constructor with all required fields
    public ApplicationEntity(
            ApplicationId id,
            String name,
            String description,
            String ownerEmail) {

        this.id = AssertUtil.requireNotNull(id, "Application id cannot be null");
        this.name = AssertUtil.requireNotBlank(name, "Application name cannot be null or empty");
        this.description = description;
        this.ownerEmail = ownerEmail;
        this.isActive = true;
    }

    // Factory method for creating a new application
    public static ApplicationEntity create(String name, String description, String ownerEmail) {
        return new ApplicationEntity(
                ApplicationId.generate(),
                name,
                description,
                ownerEmail
        );
    }

    // Domain methods
    public void deactivate() {
        this.isActive = false;
    }

    public void activate() {
        this.isActive = true;
    }

    public void updateDescription(String description) {
        this.description = description;
    }

    public boolean isActive() {
        return this.isActive;
    }

    public void addApiKey(ApplicationApiKeyEntity apiKey) {
        AssertUtil.requireNotNull(apiKey, "API key cannot be null");
        this.apiKeys.add(apiKey);
    }

    public void removeApiKey(ApplicationApiKeyEntity apiKey) {
        this.apiKeys.remove(apiKey);
    }

    // Getters
    public ApplicationId getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public String getOwnerEmail() {
        return ownerEmail;
    }

    public List<ApplicationApiKeyEntity> getApiKeys() {
        return List.copyOf(apiKeys);
    }

    public int getVersion() {
        return version;
    }

    public Long getTenantId() {
        return tenantId;
    }

    public void setTenantId(Long tenantId) {
        this.tenantId = tenantId;
    }
}
