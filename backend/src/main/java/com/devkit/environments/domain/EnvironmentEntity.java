package com.devkit.environments.domain;

import com.devkit.environments.domain.vo.EnvironmentId;
import com.devkit.shared.domain.AssertUtil;
import com.devkit.shared.domain.BaseEntity;
import jakarta.persistence.*;

/**
 * Represents an Environment (e.g., development, staging, production).
 * Environments allow applications to have different configurations for different stages.
 */
@Entity
@Table(name = "environments", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"application_id", "name"})
})
public class EnvironmentEntity extends BaseEntity {

    @EmbeddedId
    @AttributeOverride(name = "id", column = @Column(name = "id", nullable = false))
    private EnvironmentId id;

    @Column(name = "name", nullable = false, length = 50)
    private String name;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "application_id", nullable = false, length = 255)
    private String applicationId;

    @Column(name = "color", length = 7)
    private String color;

    @Column(name = "inherit_from", length = 255)
    private String inheritFromId;

    @Transient
    private EnvironmentEntity inheritFrom;

    @Version
    private int version;

    // Protected no-arg constructor for JPA
    protected EnvironmentEntity() {}

    // Public constructor
    public EnvironmentEntity(
            EnvironmentId id,
            String name,
            String description,
            String applicationId,
            String color) {

        this.id = AssertUtil.requireNotNull(id, "Environment id cannot be null");
        this.name = AssertUtil.requireNotBlank(name, "Environment name cannot be null or empty");
        this.description = description;
        this.applicationId = AssertUtil.requireNotBlank(applicationId, "Application id cannot be null or empty");
        this.color = color;
    }

    // Factory method
    public static EnvironmentEntity create(
            String name,
            String description,
            String applicationId,
            String color) {

        return new EnvironmentEntity(
                EnvironmentId.generate(),
                name,
                description,
                applicationId,
                color
        );
    }

    // Domain methods
    public void updateDescription(String description) {
        this.description = description;
    }

    public void setInheritFrom(EnvironmentEntity parent) {
        if (parent != null && parent.getId().equals(this.id)) {
            throw new IllegalArgumentException("Environment cannot inherit from itself");
        }
        this.inheritFrom = parent;
        this.inheritFromId = parent != null ? parent.getId().id() : null;
    }

    public boolean hasInheritance() {
        return inheritFromId != null;
    }

    // Getters
    public EnvironmentId getId() {
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

    public String getColor() {
        return color;
    }

    public String getInheritFromId() {
        return inheritFromId;
    }

    public EnvironmentEntity getInheritFrom() {
        return inheritFrom;
    }

    public int getVersion() {
        return version;
    }
}
