package com.devkit.templates.domain;

import com.devkit.shared.domain.AssertUtil;
import com.devkit.shared.domain.BaseEntity;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

/**
 * Represents a complete application blueprint composed of multiple templates.
 * Blueprints define the full configuration structure for an application.
 */
@Entity
@Table(name = "blueprints")
public class BlueprintEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false)
    private String id;

    @Column(name = "name", nullable = false, unique = true, length = 255)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "application_id", nullable = false, length = 255)
    private String applicationId;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "created_by", nullable = false, length = 255)
    private String createdBy;

    // Associations
    @OneToMany(mappedBy = "blueprint", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BlueprintConfigEntity> configs = new ArrayList<>();

    // Protected no-arg constructor for JPA
    protected BlueprintEntity() {}

    // Public constructor
    public BlueprintEntity(
            String name,
            String description,
            String applicationId,
            String createdBy) {

        this.name = AssertUtil.requireNotBlank(name, "Blueprint name cannot be null or empty");
        this.description = description;
        this.applicationId = AssertUtil.requireNotBlank(applicationId, "Application ID cannot be null or empty");
        this.createdBy = AssertUtil.requireNotBlank(createdBy, "Created by cannot be null or empty");
        this.isActive = true;
    }

    // Factory method
    public static BlueprintEntity create(
            String name,
            String description,
            String applicationId,
            String createdBy) {

        return new BlueprintEntity(name, description, applicationId, createdBy);
    }

    // Domain methods
    public void activate() {
        this.isActive = true;
    }

    public void deactivate() {
        this.isActive = false;
    }

    public void addConfig(BlueprintConfigEntity config) {
        this.configs.add(config);
    }

    public void removeConfig(BlueprintConfigEntity config) {
        this.configs.remove(config);
    }

    public boolean isActive() {
        return isActive;
    }

    // Getters
    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public String getApplicationId() {
        return applicationId;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public List<BlueprintConfigEntity> getConfigs() {
        return configs;
    }

    // Setters
    public void setName(String name) {
        this.name = name;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setActive(Boolean isActive) {
        this.isActive = isActive;
    }
}
