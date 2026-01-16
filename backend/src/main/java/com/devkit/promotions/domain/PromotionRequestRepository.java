package com.devkit.promotions.domain;

import com.devkit.promotions.domain.vo.PromotionRequestId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for PromotionRequestEntity.
 */
@Repository
public interface PromotionRequestRepository extends JpaRepository<PromotionRequestEntity, PromotionRequestId> {

    /**
     * Find all pending approvals.
     */
    List<PromotionRequestEntity> findByStatus(PromotionRequestEntity.PromotionStatus status);

    /**
     * Find by application.
     */
    List<PromotionRequestEntity> findByApplicationId(String applicationId);

    /**
     * Find by application and status.
     */
    List<PromotionRequestEntity> findByApplicationIdAndStatus(
        String applicationId,
        PromotionRequestEntity.PromotionStatus status
    );

    /**
     * Find recent promotions.
     */
    @Query("SELECT p FROM PromotionRequestEntity p ORDER BY p.createdAt DESC")
    List<PromotionRequestEntity> findRecent();

    /**
     * Find promotions by source and target environment.
     */
    List<PromotionRequestEntity> findBySourceEnvironmentAndTargetEnvironment(
        String sourceEnvironment,
        String targetEnvironment
    );

    /**
     * Find completed promotions.
     */
    @Query("SELECT p FROM PromotionRequestEntity p WHERE p.status = :status ORDER BY p.completedAt DESC")
    List<PromotionRequestEntity> findCompleted(@Param("status") PromotionRequestEntity.PromotionStatus status);

    /**
     * Count by status.
     */
    long countByStatus(PromotionRequestEntity.PromotionStatus status);

    /**
     * Find with diffs.
     */
    @Query("SELECT p FROM PromotionRequestEntity p LEFT JOIN FETCH p.diffs WHERE p.id = :id")
    Optional<PromotionRequestEntity> findByIdWithDiffs(@Param("id") PromotionRequestId id);
}
