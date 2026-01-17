package com.devkit.templates.domain;

import com.devkit.shared.domain.AssertUtil;
import com.devkit.shared.domain.BaseEntity;
import jakarta.persistence.*;

import java.time.Instant;

/**
 * Represents a version of a template with schema and default values.
 * Maintains history of all template changes.
 */
@Entity
@Table(name = "template_versions")
public class TemplateVersionEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id", nullable = false)
    private TemplateEntity template;

    @Column(name = "version", nullable = false)
    private Integer version;

    @Column(name = "schema", columnDefinition = "TEXT")
    private String schema; // JSON schema defining structure

    @Column(name = "default_values", columnDefinition = "TEXT")
    private String defaultValues; // JSON object with default values

    @Column(name = "validation_rules", columnDefinition = "TEXT")
    private String validationRules; // JSON object with validation rules

    @Column(name = "change_description", columnDefinition = "TEXT")
    private String changeDescription;

    @Column(name = "created_by", nullable = false, length = 255)
    private String createdBy;

    @Column(name = "is_current", nullable = false)
    private Boolean isCurrent = true;

    // Protected no-arg constructor for JPA
    protected TemplateVersionEntity() {}

    // Public constructor
    public TemplateVersionEntity(
            TemplateEntity template,
            Integer version,
            String schema,
            String defaultValues,
            String validationRules,
            String createdBy) {

        this.template = AssertUtil.requireNotNull(template, "Template cannot be null");
        this.version = AssertUtil.requireNotNull(version, "Version cannot be null");
        this.schema = schema;
        this.defaultValues = defaultValues;
        this.validationRules = validationRules;
        this.createdBy = AssertUtil.requireNotBlank(createdBy, "Created by cannot be null or empty");
        this.isCurrent = true;
    }

    // Factory method
    public static TemplateVersionEntity create(
            TemplateEntity template,
            Integer version,
            String schema,
            String defaultValues,
            String validationRules,
            String createdBy) {

        return new TemplateVersionEntity(
                template,
                version,
                schema,
                defaultValues,
                validationRules,
                createdBy
        );
    }

    // Domain methods
    public void markAsCurrent() {
        this.isCurrent = true;
    }

    public void markAsPrevious() {
        this.isCurrent = false;
    }

    // Getters
    public Long getId() {
        return id;
    }

    public TemplateEntity getTemplate() {
        return template;
    }

    public Integer getVersion() {
        return version;
    }

    public String getSchema() {
        return schema;
    }

    public String getDefaultValues() {
        return defaultValues;
    }

    public String getValidationRules() {
        return validationRules;
    }

    public String getChangeDescription() {
        return changeDescription;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public Boolean getIsCurrent() {
        return isCurrent;
    }

    // Setters
    public void setChangeDescription(String changeDescription) {
        this.changeDescription = changeDescription;
    }

    public void setSchema(String schema) {
        this.schema = schema;
    }

    public void setDefaultValues(String defaultValues) {
        this.defaultValues = defaultValues;
    }

    public void setValidationRules(String validationRules) {
        this.validationRules = validationRules;
    }

    public void setIsCurrent(Boolean isCurrent) {
        this.isCurrent = isCurrent;
    }

    public void setTemplate(TemplateEntity template) {
        this.template = template;
    }
}
