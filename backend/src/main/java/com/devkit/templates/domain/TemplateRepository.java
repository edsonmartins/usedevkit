package com.devkit.templates.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for TemplateEntity.
 */
@Repository
public interface TemplateRepository extends JpaRepository<TemplateEntity, Long> {

    /**
     * Find active templates.
     */
    List<TemplateEntity> findByIsActive(Boolean isActive);

    /**
     * Find by category.
     */
    List<TemplateEntity> findByCategory(String category);

    /**
     * Find by name.
     */
    Optional<TemplateEntity> findByName(String name);

    /**
     * Find templates by tag.
     */
    @Query("SELECT t FROM TemplateEntity t WHERE t.tags LIKE %:tag%")
    List<TemplateEntity> findByTag(@Param("tag") String tag);

    /**
     * Find template with versions.
     */
    @Query("SELECT t FROM TemplateEntity t LEFT JOIN FETCH t.versions WHERE t.id = :id")
    Optional<TemplateEntity> findByIdWithVersions(@Param("id") Long id);

    /**
     * Count by status.
     */
    long countByIsActive(Boolean isActive);
}
