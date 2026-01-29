package com.devkit.featureFlags.domain;

import com.devkit.featureFlags.domain.vo.FeatureFlagId;
import com.devkit.shared.domain.ResourceNotFoundException;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

/**
 * Repository for FeatureFlagEntity aggregate root.
 */
interface FeatureFlagRepository extends JpaRepository<FeatureFlagEntity, FeatureFlagId> {

    @Query("""
            SELECT f FROM FeatureFlagEntity f
            WHERE f.applicationId = :applicationId
            AND f.isActive = true
            ORDER BY f.key ASC
            """)
    List<FeatureFlagEntity> findActiveByApplicationId(@Param("applicationId") String applicationId);

    @Query("""
            SELECT f FROM FeatureFlagEntity f
            WHERE f.applicationId = :applicationId
            AND f.key = :key
            """)
    Optional<FeatureFlagEntity> findByApplicationIdAndKey(
            @Param("applicationId") String applicationId,
            @Param("key") String key
    );

    @Query("""
            SELECT f FROM FeatureFlagEntity f
            WHERE f.applicationId = :applicationId
            AND f.isActive = true
            AND f.status = 'ENABLED'
            ORDER BY f.key ASC
            """)
    List<FeatureFlagEntity> findEnabledByApplicationId(@Param("applicationId") String applicationId);

    @Query("""
            SELECT f FROM FeatureFlagEntity f
            WHERE f.applicationId = :applicationId
            AND f.isActive = true
            AND f.status = 'CONDITIONAL'
            ORDER BY f.key ASC
            """)
    List<FeatureFlagEntity> findConditionalByApplicationId(@Param("applicationId") String applicationId);

    long countByApplicationIdAndIsActiveTrue(String applicationId);

    default FeatureFlagEntity getByApplicationIdAndKey(String applicationId, String key) {
        return this.findByApplicationIdAndKey(applicationId, key)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Feature flag not found with applicationId: " + applicationId + " and key: " + key));
    }
}
