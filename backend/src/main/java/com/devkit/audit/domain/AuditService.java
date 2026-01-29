package com.devkit.audit.domain;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * Service for writing and querying audit logs.
 */
@Service
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public AuditLogEntity log(
            String entityType,
            String entityId,
            String action,
            String actor,
            String ipAddress,
            String userAgent,
            boolean success,
            String errorMessage) {
        AuditLogEntity entry = AuditLogEntity.create(
            entityType,
            entityId,
            action,
            actor,
            ipAddress,
            userAgent,
            success,
            errorMessage
        );
        return auditLogRepository.save(entry);
    }

    public Page<AuditLogEntity> getLogs(int page, int limit) {
        Pageable pageable = PageRequest.of(page, Math.max(1, limit));
        return auditLogRepository.findAllByOrderByCreatedAtDesc(pageable);
    }

    public AuditLogEntity getById(String id) {
        return auditLogRepository.findById(id).orElse(null);
    }

    public List<AuditLogEntity> getByEntity(String entityType, String entityId) {
        return auditLogRepository.findByEntityTypeAndEntityIdOrderByCreatedAtDesc(entityType, entityId);
    }

    public List<AuditLogEntity> getByUser(String userId) {
        return auditLogRepository.findByActorOrderByCreatedAtDesc(userId);
    }

    public long countSinceDays(int days) {
        Instant since = Instant.now().minus(days, ChronoUnit.DAYS);
        return auditLogRepository.countByCreatedAtAfter(since);
    }
}
