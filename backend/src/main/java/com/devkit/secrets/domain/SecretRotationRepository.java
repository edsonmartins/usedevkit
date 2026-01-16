package com.devkit.secrets.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

/**
 * Repository for SecretRotationEntity.
 */
@Repository
public interface SecretRotationRepository extends JpaRepository<SecretRotationEntity, String> {

    /**
     * Find all rotations for a specific secret.
     */
    List<SecretRotationEntity> findBySecretIdOrderByRotationDateDesc(String secretId);

    /**
     * Find successful rotations for a specific secret.
     */
    List<SecretRotationEntity> findBySecretIdAndStatusOrderByRotationDateDesc(
            String secretId,
            SecretRotationEntity.RotationStatus status
    );

    /**
     * Find rotations by application.
     */
    List<SecretRotationEntity> findByApplicationIdOrderByRotationDateDesc(String applicationId);

    /**
     * Find rotations by application and environment.
     */
    List<SecretRotationEntity> findByApplicationIdAndEnvironmentIdOrderByRotationDateDesc(
            String applicationId,
            String environmentId
    );

    /**
     * Find recent rotations (last N days).
     */
    List<SecretRotationEntity> findByRotationDateAfterOrderByRotationDateDesc(Instant since);

    /**
     * Count rotations by secret.
     */
    long countBySecretId(String secretId);

    /**
     * Find failed rotations.
     */
    List<SecretRotationEntity> findByStatusOrderByRotationDateDesc(
            SecretRotationEntity.RotationStatus status
    );
}
