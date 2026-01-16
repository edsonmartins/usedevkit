package com.devkit.rbac.domain;

import com.devkit.shared.domain.AssertUtil;
import com.devkit.shared.domain.BaseEntity;
import jakarta.persistence.*;

import java.util.HashSet;
import java.util.Set;

/**
 * Represents a role that aggregates multiple permissions.
 * Roles are assigned to users within a tenant context.
 */
@Entity
@Table(name = "roles")
public class RoleEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_system_role", nullable = false)
    private Boolean isSystemRole = false;

    @Column(name = "tenant_id")
    private Long tenantId; // null for system roles, specific for custom roles

    // Associations
    @ManyToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
        name = "role_permissions",
        joinColumns = @JoinColumn(name = "role_id"),
        inverseJoinColumns = @JoinColumn(name = "permission_id")
    )
    private Set<PermissionEntity> permissions = new HashSet<>();

    // Protected no-arg constructor for JPA
    protected RoleEntity() {}

    // Public constructor
    public RoleEntity(
            String name,
            String description,
            Long tenantId,
            Boolean isSystemRole) {

        this.name = AssertUtil.requireNotBlank(name, "Role name cannot be null or empty");
        this.description = description;
        this.tenantId = tenantId;
        this.isSystemRole = isSystemRole != null ? isSystemRole : false;
    }

    // Factory methods
    public static RoleEntity createSystemRole(String name, String description) {
        return new RoleEntity(name, description, null, true);
    }

    public static RoleEntity createCustomRole(String name, String description, Long tenantId) {
        return new RoleEntity(name, description, tenantId, false);
    }

    // Domain methods
    public void addPermission(PermissionEntity permission) {
        this.permissions.add(permission);
    }

    public void removePermission(PermissionEntity permission) {
        this.permissions.remove(permission);
    }

    public boolean hasPermission(String resource, String action) {
        return permissions.stream()
            .anyMatch(p -> p.matches(resource, action));
    }

    public boolean isSystemRole() {
        return isSystemRole;
    }

    public boolean isCustomRole() {
        return !isSystemRole;
    }

    // Getters
    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public Boolean getIsSystemRole() {
        return isSystemRole;
    }

    public Long getTenantId() {
        return tenantId;
    }

    public Set<PermissionEntity> getPermissions() {
        return permissions;
    }

    // Setters
    public void setName(String name) {
        this.name = name;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setTenantId(Long tenantId) {
        this.tenantId = tenantId;
    }

    public void setPermissions(Set<PermissionEntity> permissions) {
        this.permissions = permissions;
    }

    public void setIsSystemRole(Boolean isSystemRole) {
        this.isSystemRole = isSystemRole;
    }
}
