package com.devkit.templates.domain;

import com.devkit.shared.domain.AssertUtil;
import com.devkit.shared.domain.BaseEntity;
import jakarta.persistence.*;

/**
 * Represents a configuration within a blueprint that inherits from a template.
 * Combines template defaults with blueprint-specific overrides.
 */
@Entity
@Table(name = "blueprint_configs")
public class BlueprintConfigEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "blueprint_id", nullable = false)
    private BlueprintEntity blueprint;

    @Column(name = "config_key", nullable = false, length = 255)
    private String configKey;

    @Column(name = "template_id")
    private String templateId; // Optional: inherit from template

    @Column(name = "value_override", columnDefinition = "TEXT")
    private String valueOverride; // Override template default

    @Column(name = "environment_id", length = 100)
    private String environmentId; // Optional: environment-specific

    @Column(name = "is_required", nullable = false)
    private Boolean isRequired = false;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    // Protected no-arg constructor for JPA
    protected BlueprintConfigEntity() {}

    // Public constructor
    public BlueprintConfigEntity(
            BlueprintEntity blueprint,
            String configKey,
            String templateId,
            String valueOverride,
            String environmentId,
            Boolean isRequired,
            String description) {

        this.blueprint = AssertUtil.requireNotNull(blueprint, "Blueprint cannot be null");
        this.configKey = AssertUtil.requireNotBlank(configKey, "Config key cannot be null or empty");
        this.templateId = templateId;
        this.valueOverride = valueOverride;
        this.environmentId = environmentId;
        this.isRequired = isRequired != null ? isRequired : false;
        this.description = description;
    }

    // Factory methods
    public static BlueprintConfigEntity createWithTemplate(
            BlueprintEntity blueprint,
            String configKey,
            String templateId,
            String valueOverride) {

        return new BlueprintConfigEntity(
                blueprint,
                configKey,
                templateId,
                valueOverride,
                null,
                false,
                null
        );
    }

    public static BlueprintConfigEntity createWithoutTemplate(
            BlueprintEntity blueprint,
            String configKey,
            String value,
            Boolean isRequired) {

        return new BlueprintConfigEntity(
                blueprint,
                configKey,
                null,
                value,
                null,
                isRequired,
                null
        );
    }

    // Domain methods
    public boolean hasTemplate() {
        return templateId != null;
    }

    public boolean hasOverride() {
        return valueOverride != null && !valueOverride.isEmpty();
    }

    public boolean isEnvironmentSpecific() {
        return environmentId != null && !environmentId.isEmpty();
    }

    // Getters
    public String getId() {
        return id;
    }

    public BlueprintEntity getBlueprint() {
        return blueprint;
    }

    public String getConfigKey() {
        return configKey;
    }

    public String getTemplateId() {
        return templateId;
    }

    public String getValueOverride() {
        return valueOverride;
    }

    public String getEnvironmentId() {
        return environmentId;
    }

    public Boolean getIsRequired() {
        return isRequired;
    }

    public String getDescription() {
        return description;
    }

    // Setters
    public void setBlueprint(BlueprintEntity blueprint) {
        this.blueprint = blueprint;
    }

    public void setConfigKey(String configKey) {
        this.configKey = configKey;
    }

    public void setTemplateId(String templateId) {
        this.templateId = templateId;
    }

    public void setValueOverride(String valueOverride) {
        this.valueOverride = valueOverride;
    }

    public void setEnvironmentId(String environmentId) {
        this.environmentId = environmentId;
    }

    public void setIsRequired(Boolean isRequired) {
        this.isRequired = isRequired;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
