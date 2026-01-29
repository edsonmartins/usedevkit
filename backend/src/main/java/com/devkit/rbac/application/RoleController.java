package com.devkit.rbac.application;

import com.devkit.rbac.domain.*;
import com.devkit.rbac.dto.*;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

/**
 * REST controller for role and permission management.
 */
@RestController
@RequestMapping("/api/v1/rbac")
public class RoleController {

    private final PermissionService permissionService;

    public RoleController(PermissionService permissionService) {
        this.permissionService = permissionService;
    }

    // ==================== Roles ====================

    /**
     * Create a custom role.
     * POST /api/v1/rbac/roles
     */
    @PostMapping("/roles")
    public ResponseEntity<Long> createRole(@Valid @RequestBody CreateRoleDTO dto) {
        Long roleId = permissionService.createRole(
            dto.name(),
            dto.description(),
            dto.tenantId(),
            dto.permissionIds(),
            "system"
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(roleId);
    }

    /**
     * Get all roles.
     * GET /api/v1/rbac/roles
     */
    @GetMapping("/roles")
    public ResponseEntity<List<RoleDTO>> getAllRoles() {
        List<RoleEntity> roles = permissionService.getAllRoles();
        List<RoleDTO> roleDTOs = roles.stream()
            .map(this::mapToRoleDTO)
            .toList();
        return ResponseEntity.ok(roleDTOs);
    }

    /**
     * Get system roles.
     * GET /api/v1/rbac/roles/system
     */
    @GetMapping("/roles/system")
    public ResponseEntity<List<RoleDTO>> getSystemRoles() {
        List<RoleEntity> roles = permissionService.getSystemRoles();
        List<RoleDTO> roleDTOs = roles.stream()
            .map(this::mapToRoleDTO)
            .toList();
        return ResponseEntity.ok(roleDTOs);
    }

    /**
     * Get custom roles for a tenant.
     * GET /api/v1/rbac/roles/tenant/{tenantId}
     */
    @GetMapping("/roles/tenant/{tenantId}")
    public ResponseEntity<List<RoleDTO>> getCustomRoles(@PathVariable Long tenantId) {
        List<RoleEntity> roles = permissionService.getCustomRoles(tenantId);
        List<RoleDTO> roleDTOs = roles.stream()
            .map(this::mapToRoleDTO)
            .toList();
        return ResponseEntity.ok(roleDTOs);
    }

    /**
     * Get role by ID.
     * GET /api/v1/rbac/roles/{id}
     */
    @GetMapping("/roles/{id}")
    public ResponseEntity<RoleDTO> getRoleById(@PathVariable Long id) {
        RoleEntity role = permissionService.getRole(id);
        return ResponseEntity.ok(mapToRoleDTO(role));
    }

    /**
     * Update role.
     * PUT /api/v1/rbac/roles/{id}
     */
    @PutMapping("/roles/{id}")
    public ResponseEntity<Void> updateRole(
            @PathVariable Long id,
            @Valid @RequestBody UpdateRoleDTO dto) {
        permissionService.updateRole(id, dto.name(), dto.description(), dto.permissionIds());
        return ResponseEntity.ok().build();
    }

    /**
     * Delete role.
     * DELETE /api/v1/rbac/roles/{id}
     */
    @DeleteMapping("/roles/{id}")
    public ResponseEntity<Void> deleteRole(@PathVariable Long id) {
        permissionService.deleteRole(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Clone a role.
     * POST /api/v1/rbac/roles/{id}/clone
     */
    @PostMapping("/roles/{id}/clone")
    public ResponseEntity<RoleDTO> cloneRole(
            @PathVariable Long id,
            @RequestBody CloneRoleDTO request) {
        RoleEntity cloned = permissionService.cloneRole(id, request.name());
        return ResponseEntity.status(HttpStatus.CREATED).body(mapToRoleDTO(cloned));
    }

    // ==================== Permissions ====================

    /**
     * Create a custom permission.
     * POST /api/v1/rbac/permissions
     */
    @PostMapping("/permissions")
    public ResponseEntity<Long> createPermission(@Valid @RequestBody CreatePermissionDTO dto) {
        Long permissionId = permissionService.createPermission(
            dto.name(),
            dto.displayName(),
            dto.description(),
            dto.resource(),
            dto.action()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(permissionId);
    }

    /**
     * Get all permissions.
     * GET /api/v1/rbac/permissions
     */
    @GetMapping("/permissions")
    public ResponseEntity<List<PermissionDTO>> getAllPermissions() {
        List<PermissionEntity> permissions = permissionService.getAllPermissions();
        List<PermissionDTO> permissionDTOs = permissions.stream()
            .map(this::mapToPermissionDTO)
            .toList();
        return ResponseEntity.ok(permissionDTOs);
    }

    /**
     * Get permission by ID.
     * GET /api/v1/rbac/permissions/{id}
     */
    @GetMapping("/permissions/{id}")
    public ResponseEntity<PermissionDTO> getPermissionById(@PathVariable Long id) {
        PermissionEntity permission = permissionService.getPermission(id);
        return ResponseEntity.ok(mapToPermissionDTO(permission));
    }

    // ==================== User Roles ====================

    /**
     * Grant a role to a user.
     * POST /api/v1/rbac/user-roles/grant
     */
    @PostMapping("/user-roles/grant")
    public ResponseEntity<Void> grantRole(@Valid @RequestBody GrantRoleDTO dto) {
        permissionService.grantRole(
            null, // tenantId - will be extracted from JWT in production
            dto.userId(),
            dto.roleId(),
            dto.grantedBy(),
            dto.reason()
        );
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    /**
     * Revoke a role from a user.
     * DELETE /api/v1/rbac/user-roles/{tenantId}/{userId}/{roleId}
     */
    @DeleteMapping("/user-roles/{tenantId}/{userId}/{roleId}")
    public ResponseEntity<Void> revokeRole(
            @PathVariable Long tenantId,
            @PathVariable String userId,
            @PathVariable Long roleId) {
        permissionService.revokeRole(tenantId, userId, roleId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Get user's roles.
     * GET /api/v1/rbac/user-roles/{tenantId}/{userId}
     */
    @GetMapping("/user-roles/{tenantId}/{userId}")
    public ResponseEntity<List<RoleDTO>> getUserRoles(
            @PathVariable Long tenantId,
            @PathVariable String userId) {
        List<RoleEntity> roles = permissionService.getUserRoles(tenantId, userId);
        List<RoleDTO> roleDTOs = roles.stream()
            .map(this::mapToRoleDTO)
            .toList();
        return ResponseEntity.ok(roleDTOs);
    }

    // ==================== Permission Checking ====================

    /**
     * Check if user has a specific permission.
     * POST /api/v1/rbac/permissions/check
     */
    @PostMapping("/permissions/check")
    public ResponseEntity<PermissionCheckResponseDTO> checkPermission(
            @Valid @RequestBody PermissionCheckRequest dto) {
        String resource = dto.resource();
        String action = dto.action();

        if ((resource == null || action == null) && dto.permission() != null) {
            String[] parts = dto.permission().split("\\.|:");
            if (parts.length >= 2) {
                resource = parts[0];
                action = normalizeAction(parts[1]);
            }
        }

        if (resource == null || action == null) {
            throw new IllegalArgumentException("resource/action or permission must be provided");
        }

        boolean hasPermission = permissionService.hasPermission(
            dto.tenantId(),
            dto.userId(),
            resource,
            normalizeAction(action)
        );

        Set<String> userPermissions = permissionService.getUserPermissions(dto.tenantId(), dto.userId());

        PermissionCheckResponseDTO response = new PermissionCheckResponseDTO(
            hasPermission,
            dto.userId(),
            resource,
            normalizeAction(action),
            userPermissions,
            userPermissions.size()
        );

        return ResponseEntity.ok(response);
    }

    /**
     * Get all permissions for a user.
     * GET /api/v1/rbac/permissions/user/{tenantId}/{userId}
     */
    @GetMapping("/permissions/user/{tenantId}/{userId}")
    public ResponseEntity<Set<String>> getUserPermissions(
            @PathVariable Long tenantId,
            @PathVariable String userId) {
        Set<String> permissions = permissionService.getUserPermissions(tenantId, userId);
        return ResponseEntity.ok(permissions);
    }

    /**
     * Initialize system permissions and roles.
     * POST /api/v1/rbac/initialize
     */
    @PostMapping("/initialize")
    public ResponseEntity<Void> initializeSystem() {
        permissionService.initializeSystemPermissionsAndRoles();
        return ResponseEntity.ok().build();
    }

    private String normalizeAction(String action) {
        if (action == null) return null;
        return switch (action) {
            case "view" -> "read";
            case "toggle", "activate", "deactivate", "rollback", "history", "execute" -> "manage";
            case "decrypt" -> "read";
            case "create", "update", "delete", "read", "write", "manage", "rotate", "invite" -> action;
            default -> action;
        };
    }

    record PermissionCheckRequest(
        Long tenantId,
        String userId,
        String resource,
        String action,
        String permission
    ) {}

    // ==================== Helper Methods ====================

    private RoleDTO mapToRoleDTO(RoleEntity entity) {
        List<PermissionDTO> permissions = entity.getPermissions().stream()
            .map(this::mapToPermissionDTO)
            .toList();

        return new RoleDTO(
            entity.getId(),
            entity.getName(),
            entity.getDescription(),
            entity.getIsSystemRole(),
            entity.getTenantId(),
            permissions,
            permissions.size(),
            entity.getCreatedAt(),
            entity.getUpdatedAt()
        );
    }

    private PermissionDTO mapToPermissionDTO(PermissionEntity entity) {
        return new PermissionDTO(
            entity.getId(),
            entity.getName(),
            entity.getDisplayName(),
            entity.getDescription(),
            entity.getResource(),
            entity.getAction(),
            entity.getIsSystem(),
            entity.getCreatedAt()
        );
    }

    record CloneRoleDTO(String name) {}
}
