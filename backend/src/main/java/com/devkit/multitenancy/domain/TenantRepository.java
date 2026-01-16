package com.devkit.multitenancy.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for TenantEntity.
 */
@Repository
public interface TenantRepository extends JpaRepository<TenantEntity, Long>, JpaSpecificationExecutor<TenantEntity> {

    /**
     * Find a tenant by slug.
     */
    Optional<TenantEntity> findBySlug(String slug);

    /**
     * Find all active tenants.
     */
    List<TenantEntity> findByIsActiveTrue();

    /**
     * Find all inactive tenants.
     */
    List<TenantEntity> findByIsActiveFalse();

    /**
     * Find tenants by plan.
     */
    List<TenantEntity> findByPlan(TenantEntity.TenantPlan plan);

    /**
     * Find tenants by plan and active status.
     */
    List<TenantEntity> findByPlanAndIsActive(TenantEntity.TenantPlan plan, Boolean isActive);

    /**
     * Check if a tenant slug exists.
     */
    boolean existsBySlug(String slug);

    /**
     * Find tenants on trial period.
     */
    @Query("SELECT t FROM TenantEntity t WHERE t.plan = 'FREE' AND t.isActive = true AND t.createdAt > :trialStartDate")
    List<TenantEntity> findTrialTenants(@Param("trialStartDate") java.time.Instant trialStartDate);

    /**
     * Find tenants with expiring trials (within 7 days).
     */
    @Query("SELECT t FROM TenantEntity t WHERE t.plan = 'FREE' AND t.isActive = true AND t.trialEndsAt BETWEEN :now AND :weekFromNow")
    List<TenantEntity> findTenantsWithExpiringTrials(@Param("now") java.time.Instant now, @Param("weekFromNow") java.time.Instant weekFromNow);

    /**
     * Find tenants by owner email.
     */
    @Query("SELECT t FROM TenantEntity t JOIN t.users tu WHERE tu.userId = :userId AND tu.role = 'OWNER'")
    List<TenantEntity> findTenantsOwnedByUser(@Param("userId") String userId);

    /**
     * Find all tenants where a user is a member.
     */
    @Query("SELECT t FROM TenantEntity t JOIN t.users tu WHERE tu.userId = :userId")
    List<TenantEntity> findTenantsForUser(@Param("userId") String userId);

    /**
     * Count active tenants by plan.
     */
    long countByPlanAndIsActive(TenantEntity.TenantPlan plan, Boolean isActive);
}
