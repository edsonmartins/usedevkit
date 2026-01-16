package com.devkit.templates.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for BlueprintEntity.
 */
@Repository
public interface BlueprintRepository extends JpaRepository<BlueprintEntity, Long> {

    /**
     * Find active blueprints.
     */
    List<BlueprintEntity> findByIsActive(Boolean isActive);

    /**
     * Find by application ID.
     */
    List<BlueprintEntity> findByApplicationId(String applicationId);

    /**
     * Find by application ID and active status.
     */
    List<BlueprintEntity> findByApplicationIdAndIsActive(String applicationId, Boolean isActive);

    /**
     * Find by name.
     */
    Optional<BlueprintEntity> findByName(String name);

    /**
     * Find blueprint with configs.
     */
    @Query("SELECT b FROM BlueprintEntity b LEFT JOIN FETCH b.configs WHERE b.id = :id")
    Optional<BlueprintEntity> findByIdWithConfigs(@Param("id") Long id);

    /**
     * Count by status.
     */
    long countByIsActive(Boolean isActive);
}
