package com.devkit.multitenancy.application;

import com.devkit.multitenancy.domain.TenantEntity;
import com.devkit.multitenancy.domain.TenantRepository;
import com.devkit.multitenancy.domain.TenantUserEntity;
import com.devkit.multitenancy.domain.TenantUserRepository;
import com.devkit.rbac.dto.AddTenantUserDTO;
import com.devkit.rbac.dto.TenantUserDTO;
import com.devkit.rbac.dto.UpdateTenantUserDTO;
import com.devkit.shared.domain.ResourceNotFoundException;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

/**
 * REST controller for tenant user management.
 */
@RestController
@RequestMapping("/api/v1/tenants/{tenantId}/users")
public class TenantUserController {

    private final TenantUserRepository tenantUserRepository;
    private final TenantRepository tenantRepository;

    public TenantUserController(
            TenantUserRepository tenantUserRepository,
            TenantRepository tenantRepository) {
        this.tenantUserRepository = tenantUserRepository;
        this.tenantRepository = tenantRepository;
    }

    /**
     * Get all users in a tenant.
     * GET /api/v1/tenants/{tenantId}/users
     */
    @GetMapping
    public ResponseEntity<List<TenantUserDTO>> getTenantUsers(@PathVariable Long tenantId) {
        TenantEntity tenant = getTenant(tenantId);
        List<TenantUserEntity> users = tenant.getUsers();
        List<TenantUserDTO> userDTOs = users.stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
        return ResponseEntity.ok(userDTOs);
    }

    /**
     * Get active users in a tenant.
     * GET /api/v1/tenants/{tenantId}/users/active
     */
    @GetMapping("/active")
    public ResponseEntity<List<TenantUserDTO>> getActiveUsers(@PathVariable Long tenantId) {
        TenantEntity tenant = getTenant(tenantId);
        List<TenantUserEntity> users = tenant.getUsers().stream()
            .filter(TenantUserEntity::getIsActive)
            .collect(Collectors.toList());
        List<TenantUserDTO> userDTOs = users.stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
        return ResponseEntity.ok(userDTOs);
    }

    /**
     * Get a specific user in a tenant.
     * GET /api/v1/tenants/{tenantId}/users/{userId}
     */
    @GetMapping("/{userId}")
    public ResponseEntity<TenantUserDTO> getTenantUser(
            @PathVariable Long tenantId,
            @PathVariable String userId) {
        TenantEntity tenant = getTenant(tenantId);
        TenantUserEntity user = tenant.getUsers().stream()
            .filter(u -> u.getUserId().equals(userId))
            .findFirst()
            .orElseThrow(() -> new ResourceNotFoundException(
                "User " + userId + " not found in tenant " + tenantId));
        return ResponseEntity.ok(mapToDTO(user));
    }

    /**
     * Add a user to a tenant.
     * POST /api/v1/tenants/{tenantId}/users
     */
    @PostMapping
    public ResponseEntity<TenantUserDTO> addTenantUser(
            @PathVariable Long tenantId,
            @Valid @RequestBody AddTenantUserDTO dto) {
        TenantEntity tenant = getTenant(tenantId);

        // Check if user already exists in tenant
        boolean userExists = tenant.getUsers().stream()
            .anyMatch(u -> u.getUserId().equals(dto.userId()));

        if (userExists) {
            throw new IllegalArgumentException("User already exists in this tenant");
        }

        // Check tenant limits
        long currentCount = tenant.getUsers().stream()
            .filter(TenantUserEntity::getIsActive)
            .count();
        // TODO: Verify against tenant's maxUsers limit

        TenantUserEntity user = TenantUserEntity.create(
            tenant,
            dto.userId(),
            dto.email(),
            dto.name(),
            "system"
        );
        user.setRole(mapRole(dto.role()));

        TenantUserEntity saved = tenantUserRepository.save(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(mapToDTO(saved));
    }

    /**
     * Update user role in tenant.
     * PUT /api/v1/tenants/{tenantId}/users/{userId}
     */
    @PutMapping("/{userId}")
    public ResponseEntity<TenantUserDTO> updateTenantUser(
            @PathVariable Long tenantId,
            @PathVariable String userId,
            @Valid @RequestBody UpdateTenantUserDTO dto) {
        TenantEntity tenant = getTenant(tenantId);
        TenantUserEntity user = tenant.getUsers().stream()
            .filter(u -> u.getUserId().equals(userId))
            .findFirst()
            .orElseThrow(() -> new ResourceNotFoundException(
                "User " + userId + " not found in tenant " + tenantId));

        user.setRole(mapRole(dto.role()));

        if (!user.getIsActive()) {
            user.setActive(true);
            user.join();
        }

        TenantUserEntity updated = tenantUserRepository.save(user);
        return ResponseEntity.ok(mapToDTO(updated));
    }

    /**
     * Activate a user in tenant.
     * POST /api/v1/tenants/{tenantId}/users/{userId}/activate
     */
    @PostMapping("/{userId}/activate")
    public ResponseEntity<Void> activateTenantUser(
            @PathVariable Long tenantId,
            @PathVariable String userId) {
        TenantEntity tenant = getTenant(tenantId);
        TenantUserEntity user = tenant.getUsers().stream()
            .filter(u -> u.getUserId().equals(userId))
            .findFirst()
            .orElseThrow(() -> new ResourceNotFoundException(
                "User " + userId + " not found in tenant " + tenantId));

        user.setActive(true);
        if (user.getJoinedAt() == null) {
            user.join();
        }

        tenantUserRepository.save(user);
        return ResponseEntity.ok().build();
    }

    /**
     * Deactivate a user in tenant.
     * POST /api/v1/tenants/{tenantId}/users/{userId}/deactivate
     */
    @PostMapping("/{userId}/deactivate")
    public ResponseEntity<Void> deactivateTenantUser(
            @PathVariable Long tenantId,
            @PathVariable String userId) {
        TenantEntity tenant = getTenant(tenantId);
        TenantUserEntity user = tenant.getUsers().stream()
            .filter(u -> u.getUserId().equals(userId))
            .findFirst()
            .orElseThrow(() -> new ResourceNotFoundException(
                "User " + userId + " not found in tenant " + tenantId));

        user.leave();
        tenantUserRepository.save(user);
        return ResponseEntity.ok().build();
    }

    /**
     * Remove a user from tenant.
     * DELETE /api/v1/tenants/{tenantId}/users/{userId}
     */
    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> removeTenantUser(
            @PathVariable Long tenantId,
            @PathVariable String userId) {
        TenantEntity tenant = getTenant(tenantId);
        TenantUserEntity user = tenant.getUsers().stream()
            .filter(u -> u.getUserId().equals(userId))
            .findFirst()
            .orElseThrow(() -> new ResourceNotFoundException(
                "User " + userId + " not found in tenant " + tenantId));

        tenantUserRepository.delete(user);
        return ResponseEntity.noContent().build();
    }

    /**
     * Get tenant owners.
     * GET /api/v1/tenants/{tenantId}/users/owners
     */
    @GetMapping("/owners")
    public ResponseEntity<List<TenantUserDTO>> getTenantOwners(@PathVariable Long tenantId) {
        TenantEntity tenant = getTenant(tenantId);
        List<TenantUserEntity> owners = tenant.getUsers().stream()
            .filter(TenantUserEntity::isOwner)
            .collect(Collectors.toList());
        List<TenantUserDTO> ownerDTOs = owners.stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
        return ResponseEntity.ok(ownerDTOs);
    }

    /**
     * Get tenant admins (owners + admins).
     * GET /api/v1/tenants/{tenantId}/users/admins
     */
    @GetMapping("/admins")
    public ResponseEntity<List<TenantUserDTO>> getTenantAdmins(@PathVariable Long tenantId) {
        TenantEntity tenant = getTenant(tenantId);
        List<TenantUserEntity> admins = tenant.getUsers().stream()
            .filter(TenantUserEntity::isAdmin)
            .collect(Collectors.toList());
        List<TenantUserDTO> adminDTOs = admins.stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
        return ResponseEntity.ok(adminDTOs);
    }

    /**
     * Count users in tenant.
     * GET /api/v1/tenants/{tenantId}/users/count
     */
    @GetMapping("/count")
    public ResponseEntity<Long> countUsers(@PathVariable Long tenantId) {
        TenantEntity tenant = getTenant(tenantId);
        long count = tenant.getUsers().stream()
            .filter(TenantUserEntity::getIsActive)
            .count();
        return ResponseEntity.ok(count);
    }

    // ==================== Helper Methods ====================

    private TenantEntity getTenant(Long id) {
        return tenantRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Tenant not found: " + id));
    }

    private TenantUserEntity.TenantRole mapRole(AddTenantUserDTO.TenantRoleDTO dto) {
        return switch (dto) {
            case OWNER -> TenantUserEntity.TenantRole.OWNER;
            case ADMIN -> TenantUserEntity.TenantRole.ADMIN;
            case MEMBER -> TenantUserEntity.TenantRole.MEMBER;
            case VIEWER -> TenantUserEntity.TenantRole.VIEWER;
        };
    }

    private TenantUserEntity.TenantRole mapRole(UpdateTenantUserDTO.TenantRoleDTO dto) {
        return switch (dto) {
            case OWNER -> TenantUserEntity.TenantRole.OWNER;
            case ADMIN -> TenantUserEntity.TenantRole.ADMIN;
            case MEMBER -> TenantUserEntity.TenantRole.MEMBER;
            case VIEWER -> TenantUserEntity.TenantRole.VIEWER;
        };
    }

    private TenantUserDTO mapToDTO(TenantUserEntity entity) {
        return new TenantUserDTO(
            entity.getId(),
            entity.getTenant().getId(),
            entity.getUserId(),
            entity.getEmail(),
            entity.getName(),
            entity.getRole().name(),
            entity.getIsActive(),
            entity.getJoinedAt(),
            entity.getInvitedAt(),
            null // lastActiveAt - not implemented yet
        );
    }
}
