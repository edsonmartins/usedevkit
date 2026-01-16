package com.devkit.configurations.domain;

import com.devkit.shared.domain.AssertUtil;
import com.devkit.shared.domain.BaseEntity;
import jakarta.persistence.*;

/**
 * Represents a version of a Configuration.
 * Maintains history of all configuration changes for rollback capabilities.
 */
@Entity
@Table(name = "configuration_versions")
public class ConfigurationVersionEntity extends BaseEntity {

    @Column(name = "id", nullable = false)
    private String id;

    @Column(name = "version_number", nullable = false)
    private Integer versionNumber;

    @Column(name = "value", nullable = false, columnDefinition = "TEXT")
    private String value;

    @Column(name = "change_reason", length = 500)
    private String changeReason;

    @Column(name = "changed_by", length = 255)
    private String changedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "configuration_id", nullable = false)
    private ConfigurationEntity configuration;

    // Protected no-arg constructor for JPA
    protected ConfigurationVersionEntity() {}

    // Public constructor
    public ConfigurationVersionEntity(
            String id,
            Integer versionNumber,
            String value,
            String changeReason,
            String changedBy,
            ConfigurationEntity configuration) {

        this.id = AssertUtil.requireNotBlank(id, "Version id cannot be null or empty");
        this.versionNumber = AssertUtil.requireNotNull(versionNumber, "Version number cannot be null");
        this.value = AssertUtil.requireNotNull(value, "Value cannot be null");
        this.changeReason = changeReason;
        this.changedBy = changedBy;
        this.configuration = AssertUtil.requireNotNull(configuration, "Configuration cannot be null");
    }

    // Factory method
    public static ConfigurationVersionEntity create(
            Integer versionNumber,
            String value,
            String changeReason,
            String changedBy,
            ConfigurationEntity configuration) {

        return new ConfigurationVersionEntity(
                com.devkit.shared.domain.IdGenerator.generateString(),
                versionNumber,
                value,
                changeReason,
                changedBy,
                configuration
        );
    }

    // Getters
    public String getId() {
        return id;
    }

    public Integer getVersionNumber() {
        return versionNumber;
    }

    public String getValue() {
        return value;
    }

    public String getChangeReason() {
        return changeReason;
    }

    public String getChangedBy() {
        return changedBy;
    }

    public ConfigurationEntity getConfiguration() {
        return configuration;
    }
}
