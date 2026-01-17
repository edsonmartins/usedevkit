package com.devkit.applications.domain;

import com.devkit.applications.domain.vo.ApplicationKeyId;
import com.devkit.shared.domain.ResourceNotFoundException;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

/**
 * Repository for ApplicationEncryptionKeyEntity.
 * Manages per-application encryption keys for compartmentalized security.
 */
public interface ApplicationEncryptionKeyRepository extends JpaRepository<ApplicationEncryptionKeyEntity, ApplicationKeyId> {

    @Query("""
            SELECT k FROM ApplicationEncryptionKeyEntity k
            WHERE k.applicationId = :applicationId
            AND k.isActive = true
            ORDER BY k.version DESC
            """)
    List<ApplicationEncryptionKeyEntity> findActiveByApplicationId(@Param("applicationId") String applicationId);

    @Query("""
            SELECT k FROM ApplicationEncryptionKeyEntity k
            WHERE k.applicationId = :applicationId
            AND k.isActive = true
            ORDER BY k.version DESC
            """)
    Optional<ApplicationEncryptionKeyEntity> findLatestActiveByApplicationId(@Param("applicationId") String applicationId);

    @Query("""
            SELECT k FROM ApplicationEncryptionKeyEntity k
            WHERE k.applicationId = :applicationId
            ORDER BY k.version DESC
            """)
    List<ApplicationEncryptionKeyEntity> findAllByApplicationId(@Param("applicationId") String applicationId);

    @Query("""
            SELECT k FROM ApplicationEncryptionKeyEntity k
            WHERE k.keyHash = :keyHash
            """)
    Optional<ApplicationEncryptionKeyEntity> findByKeyHash(@Param("keyHash") String keyHash);

    // Convenience methods using default interface methods
    default ApplicationEncryptionKeyEntity getLatestActiveByApplicationId(String applicationId) {
        return findLatestActiveByApplicationId(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No active encryption key found for application: " + applicationId));
    }

    default boolean hasActiveEncryptionKey(String applicationId) {
        return findLatestActiveByApplicationId(applicationId).isPresent();
    }
}
