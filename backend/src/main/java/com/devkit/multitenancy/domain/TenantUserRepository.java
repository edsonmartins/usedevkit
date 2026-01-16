package com.devkit.multitenancy.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for TenantUserEntity.
 */
@Repository
public interface TenantUserRepository extends JpaRepository<TenantUserEntity, Long>, JpaSpecificationExecutor<TenantUserEntity> {

    /**
     * Find all users for a tenant.
     */
    List<TenantUserEntity> findByTenantId(Long tenantId);

    /**
     * Find a user in a tenant.
     */
    Optional<TenantUserEntity> findByTenantIdAndUserId(Long tenantId, String userId);

    /**
     * Find users by role in a tenant.
     */
    List<TenantUserEntity> findByTenantIdAndRole(Long tenantId, TenantUserEntity.TenantRole role);

    /**
     * Find all tenants where a user is a member.
     */
    List<TenantUserEntity> findByUserId(String userId);

    /**
     * Find all active users in a tenant.
     */
    List<TenantUserEntity> findByTenantIdAndIsActiveTrue(Long tenantId);

    /**
     * Count users in a tenant.
     */
    long countByTenantId(Long tenantId);

    /**
     * Count active users in a tenant.
     */
    long countByTenantIdAndIsActiveTrue(Long tenantId);

    /**
     * Count users by role in a tenant.
     */
    long countByTenantIdAndRole(Long tenantId, TenantUserEntity.TenantRole role);

    /**
     * Check if a user is a member of a tenant.
     */
    boolean existsByTenantIdAndUserId(Long tenantId, String userId);

    /**
     * Find tenant owners.
     */
    @Query("SELECT tu FROM TenantUserEntity tu WHERE tu.tenantId = :tenantId AND tu.role = 'OWNER' AND tu.isActive = true")
    List<TenantUserEntity> findTenantOwners(@Param("tenantId") Long tenantId);

    /**
     * Find tenant admins (owners + admins).
     */
    @Query("SELECT tu FROM TenantUserEntity tu WHERE tu.tenantId = :tenantId AND (tu.role = 'OWNER' OR tu.role = 'ADMIN') AND tu.isActive = true")
    List<TenantUserEntity> findTenantAdmins(@Param("tenantId") Long tenantId);

    /**
     * Find users invited but not yet joined.
     */
    @Query("SELECT tu FROM TenantUserEntity tu WHERE tu.tenantId = :tenantId AND tu.isActive = false AND tu.invitedAt IS NOT NULL")
    List<TenantUserEntity> findPendingInvitations(@Param("tenantId") Long tenantId);

    /**
     * Find all memberships for a user across all tenants.
     */
    @Query("SELECT tu FROM TenantUserEntity tu WHERE tu.userId = :userId AND tu.isActive = true")
    List<TenantUserEntity> findActiveMembershipsForUser(@Param("userId") String userId);

    /**
     * Check if a user has admin role in a tenant.
     */
    @Query("SELECT CASE WHEN COUNT(tu) > 0 THEN true ELSE false END FROM TenantUserEntity tu WHERE tu.tenantId = :tenantId AND tu.userId = :userId AND (tu.role = 'OWNER' OR tu.role = 'ADMIN') AND tu.isActive = true")
    boolean isUserAdminInTenant(@Param("tenantId") Long tenantId, @Param("userId") String userId);
}
