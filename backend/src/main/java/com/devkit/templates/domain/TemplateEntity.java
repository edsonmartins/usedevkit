package com.devkit.templates.domain;

import com.devkit.shared.domain.AssertUtil;
import com.devkit.shared.domain.BaseEntity;
import jakarta.persistence.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * Represents a reusable configuration template with versioning support.
 * Templates define default values for configurations that can be inherited.
 */
@Entity
@Table(name = "templates")
public class TemplateEntity extends BaseEntity {

    @Column(name = "name", nullable = false, unique = true, length = 255)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "category", length = 100)
    private String category;

    @Column(name = "tags", columnDefinition = "TEXT")
    private String tags; // JSON array of tags

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "created_by", nullable = false, length = 255)
    private String createdBy;

    @Column(name = "current_version", nullable = false)
    private Integer currentVersion = 1;

    // Associations
    @OneToMany(mappedBy = "template", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TemplateVersionEntity> versions = new ArrayList<>();

    // Protected no-arg constructor for JPA
    protected TemplateEntity() {}

    // Public constructor
    public TemplateEntity(
            String name,
            String description,
            String category,
            String tags,
            String createdBy) {

        this.name = AssertUtil.requireNotBlank(name, "Template name cannot be null or empty");
        this.description = description;
        this.category = category;
        this.tags = tags;
        this.createdBy = AssertUtil.requireNotBlank(createdBy, "Created by cannot be null or empty");
        this.isActive = true;
        this.currentVersion = 1;
    }

    // Factory method
    public static TemplateEntity create(
            String name,
            String description,
            String category,
            String tags,
            String createdBy) {

        return new TemplateEntity(name, description, category, tags, createdBy);
    }

    // Domain methods
    public void activate() {
        this.isActive = true;
    }

    public void deactivate() {
        this.isActive = false;
    }

    public void incrementVersion() {
        this.currentVersion++;
    }

    public TemplateVersionEntity createVersion(
            String schema,
            String defaultValues,
            String validationRules,
            String createdBy) {

        TemplateVersionEntity version = TemplateVersionEntity.create(
            this,
            this.currentVersion,
            schema,
            defaultValues,
            validationRules,
            createdBy
        );

        this.versions.add(version);

        return version;
    }

    public boolean isActive() {
        return isActive;
    }

    // Getters
    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public String getCategory() {
        return category;
    }

    public String getTags() {
        return tags;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public Integer getCurrentVersion() {
        return currentVersion;
    }

    public List<TemplateVersionEntity> getVersions() {
        return versions;
    }

    // Setters
    public void setName(String name) {
        this.name = name;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public void setTags(String tags) {
        this.tags = tags;
    }

    public void setActive(Boolean isActive) {
        this.isActive = isActive;
    }
}
