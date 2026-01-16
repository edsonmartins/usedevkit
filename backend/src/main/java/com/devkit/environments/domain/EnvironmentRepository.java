package com.devkit.environments.domain;

import com.devkit.environments.domain.vo.EnvironmentId;
import com.devkit.shared.domain.ResourceNotFoundException;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

/**
 * Repository for EnvironmentEntity aggregate root.
 */
interface EnvironmentRepository extends JpaRepository<EnvironmentEntity, EnvironmentId> {

    @Query("""
            SELECT e FROM EnvironmentEntity e
            WHERE e.applicationId = :applicationId
            ORDER BY e.name ASC
            """)
    List<EnvironmentEntity> findByApplicationId(@Param("applicationId") String applicationId);

    @Query("""
            SELECT e FROM EnvironmentEntity e
            WHERE e.applicationId = :applicationId
            AND e.name = :name
            """)
    Optional<EnvironmentEntity> findByApplicationIdAndName(
            @Param("applicationId") String applicationId,
            @Param("name") String name
    );

    @Query("""
            SELECT e FROM EnvironmentEntity e
            WHERE e.inheritFromId = :parentId
            """)
    List<EnvironmentEntity> findChildren(@Param("parentId") String parentId);

    default EnvironmentEntity getByApplicationIdAndName(String applicationId, String name) {
        return this.findByApplicationIdAndName(applicationId, name)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Environment not found with applicationId: " + applicationId + " and name: " + name));
    }
}
