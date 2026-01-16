package com.devkit.rbac.domain;

import com.devkit.shared.domain.AssertUtil;
import com.devkit.shared.domain.BaseEntity;
import jakarta.persistence.*;

import java.util.HashSet;
import java.util.Set;

/**
 * Represents a specific permission that can be granted to roles.
 * Permissions follow the pattern: resource:action (e.g., config:read, config:write)
 */
@Entity
@Table(name = "permissions")
public class PermissionEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "name", nullable = false, unique = true, length = 255)
    private String name; // e.g., "config:read"

    @Column(name = "display_name", nullable = false, length = 255)
    private String displayName; // e.g., "Read Configurations"

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "resource", nullable = false, length = 100)
    private String resource; // e.g., "config", "secret", "application"

    @Column(name = "action", nullable = false, length = 50)
    private String action; // e.g., "read", "write", "delete", "manage"

    @Column(name = "is_system", nullable = false)
    private Boolean isSystem = false; // System permissions cannot be deleted

    // Associations
    @ManyToMany(mappedBy = "permissions")
    private Set<RoleEntity> roles = new HashSet<>();

    // Protected no-arg constructor for JPA
    protected PermissionEntity() {}

    // Public constructor
    public PermissionEntity(
            String name,
            String displayName,
            String description,
            String resource,
            String action,
            Boolean isSystem) {

        this.name = AssertUtil.requireNotBlank(name, "Permission name cannot be null or empty");
        this.displayName = AssertUtil.requireNotBlank(displayName, "Display name cannot be null or empty");
        this.description = description;
        this.resource = AssertUtil.requireNotBlank(resource, "Resource cannot be null or empty");
        this.action = AssertUtil.requireNotBlank(action, "Action cannot be null or empty");
        this.isSystem = isSystem != null ? isSystem : false;
    }

    // Factory method
    public static PermissionEntity create(
            String name,
            String displayName,
            String description,
            String resource,
            String action) {

        return new PermissionEntity(
            name,
            displayName,
            description,
            resource,
            action,
            false
        );
    }

    public static PermissionEntity createSystemPermission(
            String name,
            String displayName,
            String resource,
            String action) {

        return new PermissionEntity(
            name,
            displayName,
            "System permission",
            resource,
            action,
            true
        );
    }

    // Domain methods
    public boolean matches(String resource, String action) {
        return this.resource.equals(resource) && this.action.equals(action);
    }

    public boolean isSystemPermission() {
        return isSystem;
    }

    // Getters
    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }

    public String getResource() {
        return resource;
    }

    public String getAction() {
        return action;
    }

    public Boolean getIsSystem() {
        return isSystem;
    }

    public Set<RoleEntity> getRoles() {
        return roles;
    }

    // Setters
    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setRoles(Set<RoleEntity> roles) {
        this.roles = roles;
    }
}
