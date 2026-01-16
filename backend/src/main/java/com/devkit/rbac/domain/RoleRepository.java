package com.devkit.rbac.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for RoleEntity.
 */
@Repository
public interface RoleRepository extends JpaRepository<RoleEntity, Long>, JpaSpecificationExecutor<RoleEntity> {

    /**
     * Find a role by name.
     */
    Optional<RoleEntity> findByName(String name);

    /**
     * Find all system roles.
     */
    List<RoleEntity> findByIsSystemRoleTrue();

    /**
     * Find all custom roles for a specific tenant.
     */
    List<RoleEntity> findByTenantId(Long tenantId);

    /**
     * Find a custom role by tenant and name.
     */
    Optional<RoleEntity> findByTenantIdAndName(Long tenantId, String name);

    /**
     * Check if a role name exists for a tenant.
     */
    boolean existsByTenantIdAndName(Long tenantId, String name);

    /**
     * Find all roles for a specific tenant (including system roles).
     */
    @Query("SELECT r FROM RoleEntity r WHERE r.tenantId = :tenantId OR r.isSystemRole = true")
    List<RoleEntity> findAllRolesForTenant(@Param("tenantId") Long tenantId);
}
