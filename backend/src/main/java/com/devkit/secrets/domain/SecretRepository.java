package com.devkit.secrets.domain;

import com.devkit.secrets.domain.vo.SecretId;
import com.devkit.shared.domain.ResourceNotFoundException;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

/**
 * Repository for SecretEntity aggregate root.
 */
public interface SecretRepository extends JpaRepository<SecretEntity, SecretId> {

    @Query("""
            SELECT s FROM SecretEntity s
            WHERE s.applicationId = :applicationId
            AND s.isActive = true
            ORDER BY s.key ASC
            """)
    List<SecretEntity> findActiveByApplicationId(@Param("applicationId") String applicationId);

    List<SecretEntity> findByApplicationId(String applicationId);

    List<SecretEntity> findByIsActiveTrue();

    @Query("""
            SELECT s FROM SecretEntity s
            WHERE s.applicationId = :applicationId
            AND (:environmentId IS NULL OR s.environmentId = :environmentId)
            AND s.isActive = true
            ORDER BY s.key ASC
            """)
    List<SecretEntity> findActiveByApplicationIdAndEnvironmentId(
            @Param("applicationId") String applicationId,
            @Param("environmentId") String environmentId
    );

    @Query("""
            SELECT s FROM SecretEntity s
            WHERE s.applicationId = :applicationId
            AND s.key = :key
            """)
    Optional<SecretEntity> findByApplicationIdAndKey(
            @Param("applicationId") String applicationId,
            @Param("key") String key
    );

    @Query("""
            SELECT s FROM SecretEntity s
            WHERE s.isActive = true
            AND s.rotationPolicy <> 'MANUAL'
            AND s.nextRotationDate <= :date
            """)
    List<SecretEntity> findSecretsNeedingRotation(@Param("date") Instant date);

    default List<SecretEntity> findSecretsNeedingRotation() {
        return findSecretsNeedingRotation(Instant.now());
    }

    default SecretEntity getByApplicationIdAndKey(String applicationId, String key) {
        return this.findByApplicationIdAndKey(applicationId, key)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Secret not found with applicationId: " + applicationId + " and key: " + key));
    }
}
