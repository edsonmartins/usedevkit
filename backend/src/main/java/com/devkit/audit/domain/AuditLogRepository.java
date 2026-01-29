package com.devkit.audit.domain;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;

/**
 * Repository for AuditLogEntity.
 */
public interface AuditLogRepository extends JpaRepository<AuditLogEntity, String> {

    Page<AuditLogEntity> findAllByOrderByCreatedAtDesc(Pageable pageable);

    List<AuditLogEntity> findByEntityTypeAndEntityIdOrderByCreatedAtDesc(String entityType, String entityId);

    List<AuditLogEntity> findByActorOrderByCreatedAtDesc(String actor);

    long countByCreatedAtAfter(Instant since);
}
