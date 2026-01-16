package com.devkit.services.domain;

import com.devkit.services.domain.vo.ServiceId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for ServiceEntity.
 */
@Repository
public interface ServiceRepository extends JpaRepository<ServiceEntity, ServiceId> {

    /**
     * Find all active services.
     */
    List<ServiceEntity> findByIsActiveTrue();

    /**
     * Find services by environment.
     */
    List<ServiceEntity> findByEnvironment(String environment);

    /**
     * Find services by type.
     */
    List<ServiceEntity> findByType(ServiceEntity.ServiceType type);

    /**
     * Find services by status.
     */
    List<ServiceEntity> findByStatus(ServiceEntity.ServiceStatus status);

    /**
     * Find services by team.
     */
    List<ServiceEntity> findByTeam(String team);

    /**
     * Find services by owner.
     */
    List<ServiceEntity> findByOwner(String owner);

    /**
     * Find services by name (case-insensitive).
     */
    Optional<ServiceEntity> findByNameIgnoreCase(String name);

    /**
     * Find services by name and version.
     */
    Optional<ServiceEntity> findByNameAndVersion(String name, String version);

    /**
     * Find services by language.
     */
    List<ServiceEntity> findByLanguage(String language);

    /**
     * Find services that depend on a specific service.
     */
    @Query("SELECT s FROM ServiceEntity s JOIN s.dependencies d WHERE d.targetServiceId = :serviceId")
    List<ServiceEntity> findDependents(@Param("serviceId") String serviceId);

    /**
     * Find all services with their dependencies.
     */
    @Query("SELECT s FROM ServiceEntity s LEFT JOIN FETCH s.dependencies")
    List<ServiceEntity> findAllWithDependencies();

    /**
     * Find service by ID with dependencies.
     */
    @Query("SELECT s FROM ServiceEntity s LEFT JOIN FETCH s.dependencies WHERE s.id = :id")
    Optional<ServiceEntity> findByIdWithDependencies(@Param("id") ServiceId id);

    /**
     * Count services by status.
     */
    long countByStatus(ServiceEntity.ServiceStatus status);

    long countByIsActiveTrue();

    /**
     * Count services by environment.
     */
    long countByEnvironment(String environment);

    /**
     * Count services by type.
     */
    long countByType(ServiceEntity.ServiceType type);
}
