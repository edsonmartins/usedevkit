package com.devkit.rbac.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

/**
 * Repository for UserRoleEntity.
 */
@Repository
public interface UserRoleRepository extends JpaRepository<UserRoleEntity, Long>, JpaSpecificationExecutor<UserRoleEntity> {

    /**
     * Find all user roles for a tenant and user.
     */
    List<UserRoleEntity> findByTenantIdAndUserId(Long tenantId, String userId);

    /**
     * Find all user roles for a tenant, user, and role.
     */
    List<UserRoleEntity> findByTenantIdAndUserIdAndRoleId(Long tenantId, String userId, Long roleId);

    /**
     * Find all user roles for a specific role.
     */
    List<UserRoleEntity> findByRoleId(Long roleId);

    /**
     * Find all user roles for a tenant.
     */
    List<UserRoleEntity> findByTenantId(Long tenantId);

    /**
     * Find all expired user roles.
     */
    List<UserRoleEntity> findByExpiresAtBefore(Instant date);

    /**
     * Find all user roles granted by a specific user.
     */
    List<UserRoleEntity> findByGrantedBy(String grantedBy);

    /**
     * Find valid (non-expired) roles for a user in a tenant.
     */
    @Query("SELECT ur FROM UserRoleEntity ur WHERE ur.tenantId = :tenantId AND ur.userId = :userId AND (ur.expiresAt IS NULL OR ur.expiresAt > :now)")
    List<UserRoleEntity> findValidRolesForUser(@Param("tenantId") Long tenantId, @Param("userId") String userId, @Param("now") Instant now);

    /**
     * Count all roles assigned to a user in a tenant.
     */
    long countByTenantIdAndUserId(Long tenantId, String userId);

    /**
     * Check if a user has a specific role in a tenant.
     */
    boolean existsByTenantIdAndUserIdAndRoleId(Long tenantId, String userId, Long roleId);
}
