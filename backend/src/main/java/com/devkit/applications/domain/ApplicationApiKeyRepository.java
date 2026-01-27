package com.devkit.applications.domain;

import com.devkit.auth.domain.vo.ApiKeyId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

/**
 * Repository for ApplicationApiKeyEntity.
 */
public interface ApplicationApiKeyRepository extends JpaRepository<ApplicationApiKeyEntity, ApiKeyId> {

    @Query("""
            SELECT k FROM ApplicationApiKeyEntity k
            JOIN FETCH k.application
            WHERE k.keyHash = :keyHash AND k.keyPrefix = :keyPrefix
            """)
    Optional<ApplicationApiKeyEntity> findByKeyHashAndKeyPrefix(
            @Param("keyHash") String keyHash,
            @Param("keyPrefix") String keyPrefix);

    @Query("""
            SELECT k FROM ApplicationApiKeyEntity k
            JOIN FETCH k.application
            WHERE k.keyHash = :keyHash
            """)
    Optional<ApplicationApiKeyEntity> findByKeyHash(@Param("keyHash") String keyHash);
}
