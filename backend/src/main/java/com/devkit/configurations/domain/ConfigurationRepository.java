package com.devkit.configurations.domain;

import com.devkit.configurations.domain.vo.ConfigurationId;
import com.devkit.shared.domain.ResourceNotFoundException;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

/**
 * Repository for ConfigurationEntity aggregate root.
 */
public interface ConfigurationRepository extends JpaRepository<ConfigurationEntity, ConfigurationId> {

    @Query("""
            SELECT c FROM ConfigurationEntity c
            WHERE c.environmentId = :environmentId
            ORDER BY c.key ASC
            """)
    List<ConfigurationEntity> findByEnvironmentId(@Param("environmentId") String environmentId);

    @Query("""
            SELECT c FROM ConfigurationEntity c
            WHERE c.environmentId = :environmentId
            AND c.key = :key
            """)
    Optional<ConfigurationEntity> findByEnvironmentIdAndKey(
            @Param("environmentId") String environmentId,
            @Param("key") String key
    );

    @Query("""
            SELECT c FROM ConfigurationEntity c
            WHERE c.environmentId = :environmentId
            AND c.isSecret = false
            ORDER BY c.key ASC
            """)
    List<ConfigurationEntity> findNonSecretByEnvironmentId(@Param("environmentId") String environmentId);

    @Query("""
            SELECT c FROM ConfigurationEntity c
            WHERE c.environmentId = :environmentId
            AND c.isSecret = true
            ORDER BY c.key ASC
            """)
    List<ConfigurationEntity> findSecretsByEnvironmentId(@Param("environmentId") String environmentId);

    default ConfigurationEntity getByEnvironmentIdAndKey(String environmentId, String key) {
        return this.findByEnvironmentIdAndKey(environmentId, key)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Configuration not found with environmentId: " + environmentId + " and key: " + key));
    }
}
