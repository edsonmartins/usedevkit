package com.devkit.applications.domain;

import com.devkit.applications.domain.vo.ApplicationId;
import com.devkit.shared.domain.ResourceNotFoundException;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

/**
 * Repository for ApplicationEntity aggregate root.
 */
public interface ApplicationRepository extends JpaRepository<ApplicationEntity, ApplicationId> {

    @Query("""
            SELECT a FROM ApplicationEntity a
            WHERE a.isActive = true
            ORDER BY a.name ASC
            """)
    List<ApplicationEntity> findAllActive();

    @Query("""
            SELECT a FROM ApplicationEntity a
            WHERE a.name = :name
            """)
    Optional<ApplicationEntity> findByName(@Param("name") String name);

    @Query("""
            SELECT a FROM ApplicationEntity a
            WHERE a.ownerEmail = :email
            ORDER BY a.name ASC
            """)
    List<ApplicationEntity> findByOwnerEmail(@Param("email") String email);

    // Convenience methods using default interface methods
    default ApplicationEntity getByName(String name) {
        return this.findByName(name)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with name: " + name));
    }

    default ApplicationId getByNameAsId(String name) {
        return this.findByName(name)
                .map(ApplicationEntity::getId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with name: " + name));
    }
}
