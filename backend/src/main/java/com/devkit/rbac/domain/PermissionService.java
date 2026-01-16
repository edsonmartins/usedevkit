package com.devkit.rbac.domain;

import com.devkit.shared.domain.ResourceNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Service for checking permissions and managing RBAC.
 */
@Service
@Transactional
public class PermissionService {

    private static final Logger logger = LoggerFactory.getLogger(PermissionService.class);

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final UserRoleRepository userRoleRepository;

    public PermissionService(
            RoleRepository roleRepository,
            PermissionRepository permissionRepository,
            UserRoleRepository userRoleRepository) {
        this.roleRepository = roleRepository;
        this.permissionRepository = permissionRepository;
        this.userRoleRepository = userRoleRepository;
    }

    // ==================== Permission Checking ====================

    /**
     * Check if a user has a specific permission in a tenant.
     */
    public boolean hasPermission(Long tenantId, String userId, String resource, String action) {
        List<UserRoleEntity> userRoles = userRoleRepository.findByTenantIdAndUserId(tenantId, userId);

        for (UserRoleEntity userRole : userRoles) {
            if (!userRole.isValid()) {
                continue;
            }

            RoleEntity role = userRole.getRole();
            if (role.hasPermission(resource, action)) {
                logger.debug("User {} has permission {}:{}", userId, resource, action);
                return true;
            }
        }

        logger.debug("User {} does NOT have permission {}:{}", userId, resource, action);
        return false;
    }

    /**
     * Check if a user has ANY of the specified permissions.
     */
    public boolean hasAnyPermission(Long tenantId, String userId, List<PermissionCheck> permissions) {
        return permissions.stream()
            .anyMatch(p -> hasPermission(tenantId, userId, p.resource(), p.action()));
    }

    /**
     * Check if a user has ALL of the specified permissions.
     */
    public boolean hasAllPermissions(Long tenantId, String userId, List<PermissionCheck> permissions) {
        return permissions.stream()
            .allMatch(p -> hasPermission(tenantId, userId, p.resource(), p.action()));
    }

    /**
     * Get all permissions for a user in a tenant.
     */
    public Set<String> getUserPermissions(Long tenantId, String userId) {
        List<UserRoleEntity> userRoles = userRoleRepository.findByTenantIdAndUserId(tenantId, userId);

        return userRoles.stream()
            .filter(UserRoleEntity::isValid)
            .flatMap(ur -> ur.getRole().getPermissions().stream())
            .map(PermissionEntity::getName)
            .collect(Collectors.toSet());
    }

    /**
     * Get all roles for a user in a tenant.
     */
    public List<RoleEntity> getUserRoles(Long tenantId, String userId) {
        List<UserRoleEntity> userRoles = userRoleRepository.findByTenantIdAndUserId(tenantId, userId);

        return userRoles.stream()
            .filter(UserRoleEntity::isValid)
            .map(UserRoleEntity::getRole)
            .collect(Collectors.toList());
    }

    // ==================== Role Management ====================

    /**
     * Grant a role to a user.
     */
    public void grantRole(Long tenantId, String userId, Long roleId, String grantedBy, String reason) {
        RoleEntity role = getRole(roleId);

        // Check if user already has this role
        List<UserRoleEntity> existing = userRoleRepository.findByTenantIdAndUserIdAndRoleId(
            tenantId, userId, roleId
        );

        if (!existing.isEmpty()) {
            throw new IllegalStateException("User already has this role");
        }

        UserRoleEntity userRole = UserRoleEntity.create(
            tenantId,
            userId,
            role,
            grantedBy
        );
        userRole.setReason(reason);

        userRoleRepository.save(userRole);

        logger.info("Granted role {} to user {} in tenant {}", role.getName(), userId, tenantId);
    }

    /**
     * Revoke a role from a user.
     */
    public void revokeRole(Long tenantId, String userId, Long roleId) {
        List<UserRoleEntity> userRoles = userRoleRepository.findByTenantIdAndUserIdAndRoleId(
            tenantId, userId, roleId
        );

        if (userRoles.isEmpty()) {
            throw new IllegalStateException("User does not have this role");
        }

        userRoleRepository.deleteAll(userRoles);

        logger.info("Revoked role {} from user {} in tenant {}", roleId, userId, tenantId);
    }

    /**
     * Create a custom role.
     */
    public Long createRole(
            String name,
            String description,
            Long tenantId,
            List<Long> permissionIds,
            String createdBy) {

        // Check if role name already exists for this tenant
        roleRepository.findByTenantIdAndName(tenantId, name).ifPresent(r -> {
            throw new IllegalArgumentException("Role already exists: " + name);
        });

        RoleEntity role = RoleEntity.createCustomRole(name, description, tenantId);

        // Add permissions
        if (permissionIds != null && !permissionIds.isEmpty()) {
            for (Long permissionId : permissionIds) {
                PermissionEntity permission = getPermission(permissionId);
                role.addPermission(permission);
            }
        }

        RoleEntity saved = roleRepository.save(role);

        logger.info("Created custom role {} for tenant {}", name, tenantId);

        return saved.getId();
    }

    /**
     * Update a role.
     */
    public void updateRole(Long roleId, String name, String description, List<Long> permissionIds) {
        RoleEntity role = getRole(roleId);

        if (role.isSystemRole()) {
            throw new IllegalStateException("Cannot modify system roles");
        }

        role.setName(name);
        role.setDescription(description);

        // Update permissions
        role.getPermissions().clear();
        if (permissionIds != null && !permissionIds.isEmpty()) {
            for (Long permissionId : permissionIds) {
                PermissionEntity permission = getPermission(permissionId);
                role.addPermission(permission);
            }
        }

        roleRepository.save(role);

        logger.info("Updated role {}", roleId);
    }

    /**
     * Delete a custom role.
     */
    public void deleteRole(Long roleId) {
        RoleEntity role = getRole(roleId);

        if (role.isSystemRole()) {
            throw new IllegalStateException("Cannot delete system roles");
        }

        roleRepository.delete(role);

        logger.info("Deleted role {}", roleId);
    }

    // ==================== Permission Management ====================

    /**
     * Create a permission.
     */
    public Long createPermission(
            String name,
            String displayName,
            String description,
            String resource,
            String action) {

        // Check if permission already exists
        permissionRepository.findByName(name).ifPresent(p -> {
            throw new IllegalArgumentException("Permission already exists: " + name);
        });

        PermissionEntity permission = PermissionEntity.create(
            name,
            displayName,
            description,
            resource,
            action
        );

        PermissionEntity saved = permissionRepository.save(permission);

        logger.info("Created permission {}", name);

        return saved.getId();
    }

    /**
     * Initialize system permissions and roles.
     */
    public void initializeSystemPermissionsAndRoles() {
        // Create system permissions
        createSystemPermissionIfNotExists("config:read", "Read Configurations", "config", "read");
        createSystemPermissionIfNotExists("config:write", "Write Configurations", "config", "write");
        createSystemPermissionIfNotExists("config:delete", "Delete Configurations", "config", "delete");
        createSystemPermissionIfNotExists("secret:read", "Read Secrets", "secret", "read");
        createSystemPermissionIfNotExists("secret:write", "Write Secrets", "secret", "write");
        createSystemPermissionIfNotExists("secret:rotate", "Rotate Secrets", "secret", "rotate");
        createSystemPermissionIfNotExists("secret:delete", "Delete Secrets", "secret", "delete");
        createSystemPermissionIfNotExists("application:manage", "Manage Applications", "application", "manage");
        createSystemPermissionIfNotExists("environment:manage", "Manage Environments", "environment", "manage");
        createSystemPermissionIfNotExists("promotion:execute", "Execute Promotions", "promotion", "execute");
        createSystemPermissionIfNotExists("promotion:approve", "Approve Promotions", "promotion", "approve");
        createSystemPermissionIfNotExists("user:manage", "Manage Users", "user", "manage");
        createSystemPermissionIfNotExists("role:manage", "Manage Roles", "role", "manage");
        createSystemPermissionIfNotExists("tenant:manage", "Manage Tenant Settings", "tenant", "manage");
        createSystemPermissionIfNotExists("webhook:manage", "Manage Webhooks", "webhook", "manage");
        createSystemPermissionIfNotExists("template:manage", "Manage Templates", "template", "manage");

        // Create system roles
        createSystemRoleIfNotExists("SUPER_ADMIN", "Full system access", List.of(
            "config:read", "config:write", "config:delete",
            "secret:read", "secret:write", "secret:rotate", "secret:delete",
            "application:manage", "environment:manage",
            "promotion:execute", "promotion:approve",
            "user:manage", "role:manage", "tenant:manage",
            "webhook:manage", "template:manage"
        ));

        createSystemRoleIfNotExists("TENANT_ADMIN", "Full tenant access", List.of(
            "config:read", "config:write", "config:delete",
            "secret:read", "secret:write", "secret:rotate", "secret:delete",
            "application:manage", "environment:manage",
            "promotion:execute", "promotion:approve",
            "user:manage",
            "webhook:manage", "template:manage"
        ));

        createSystemRoleIfNotExists("DEVELOPER", "Developer access", List.of(
            "config:read", "config:write",
            "secret:read",
            "application:manage",
            "promotion:execute"
        ));

        createSystemRoleIfNotExists("VIEWER", "Read-only access", List.of(
            "config:read",
            "secret:read"
        ));

        logger.info("System permissions and roles initialized");
    }

    private void createSystemPermissionIfNotExists(
            String name,
            String displayName,
            String resource,
            String action) {

        permissionRepository.findByName(name).ifPresentOrElse(
            existing -> {},
            () -> {
                PermissionEntity permission = PermissionEntity.createSystemPermission(
                    name, displayName, resource, action
                );
                permissionRepository.save(permission);
            }
        );
    }

    private void createSystemRoleIfNotExists(String name, String description, List<String> permissionNames) {
        roleRepository.findByName(name).ifPresentOrElse(
            existing -> {},
            () -> {
                RoleEntity role = RoleEntity.createSystemRole(name, description);

                for (String permName : permissionNames) {
                    permissionRepository.findByName(permName).ifPresent(permission -> {
                        role.addPermission(permission);
                    });
                }

                roleRepository.save(role);
            }
        );
    }

    // ==================== Query Methods ====================

    public RoleEntity getRole(Long roleId) {
        return roleRepository.findById(roleId)
            .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + roleId));
    }

    public PermissionEntity getPermission(Long permissionId) {
        return permissionRepository.findById(permissionId)
            .orElseThrow(() -> new ResourceNotFoundException("Permission not found: " + permissionId));
    }

    public List<RoleEntity> getAllRoles() {
        return roleRepository.findAll();
    }

    public List<RoleEntity> getSystemRoles() {
        return roleRepository.findByIsSystemRoleTrue();
    }

    public List<RoleEntity> getCustomRoles(Long tenantId) {
        return roleRepository.findByTenantId(tenantId);
    }

    public List<PermissionEntity> getAllPermissions() {
        return permissionRepository.findAll();
    }

    // ==================== Record Classes ====================

    public record PermissionCheck(
        String resource,
        String action
    ) {}
}
