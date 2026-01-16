package com.devkit.rbac.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for PermissionEntity.
 */
@Repository
public interface PermissionRepository extends JpaRepository<PermissionEntity, Long>, JpaSpecificationExecutor<PermissionEntity> {

    /**
     * Find a permission by name.
     */
    Optional<PermissionEntity> findByName(String name);

    /**
     * Find all system permissions.
     */
    List<PermissionEntity> findByIsSystemTrue();

    /**
     * Find all custom permissions.
     */
    List<PermissionEntity> findByIsSystemFalse();

    /**
     * Find permissions by resource.
     */
    List<PermissionEntity> findByResource(String resource);

    /**
     * Find permissions by resource and action.
     */
    Optional<PermissionEntity> findByResourceAndAction(String resource, String action);

    /**
     * Check if a permission name exists.
     */
    boolean existsByName(String name);

    /**
     * Find all permissions with names in the given list.
     */
    List<PermissionEntity> findByNameIn(List<String> names);
}
