package com.devkit.audit.domain;

import com.devkit.shared.domain.AssertUtil;
import com.devkit.shared.domain.IdGenerator;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.Instant;

/**
 * Immutable audit log entry for system actions.
 */
@Entity
@Table(name = "audit_logs")
public class AuditLogEntity {

    @Id
    @Column(name = "id", nullable = false, updatable = false, length = 255)
    private String id;

    @Column(name = "entity_type", nullable = false, length = 100)
    private String entityType;

    @Column(name = "entity_id", nullable = false, length = 255)
    private String entityId;

    @Column(name = "action", nullable = false, length = 50)
    private String action;

    @Column(name = "actor", length = 255)
    private String actor;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "user_agent", columnDefinition = "TEXT")
    private String userAgent;

    @Column(name = "success", nullable = false)
    private Boolean success;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected AuditLogEntity() {}

    private AuditLogEntity(
            String entityType,
            String entityId,
            String action,
            String actor,
            String ipAddress,
            String userAgent,
            boolean success,
            String errorMessage) {
        this.id = IdGenerator.generateString();
        this.entityType = AssertUtil.requireNotBlank(entityType, "Entity type cannot be null or empty");
        this.entityId = AssertUtil.requireNotBlank(entityId, "Entity id cannot be null or empty");
        this.action = AssertUtil.requireNotBlank(action, "Action cannot be null or empty");
        this.actor = actor;
        this.ipAddress = ipAddress;
        this.userAgent = userAgent;
        this.success = success;
        this.errorMessage = errorMessage;
        this.createdAt = Instant.now();
    }

    public static AuditLogEntity create(
            String entityType,
            String entityId,
            String action,
            String actor,
            String ipAddress,
            String userAgent,
            boolean success,
            String errorMessage) {
        return new AuditLogEntity(entityType, entityId, action, actor, ipAddress, userAgent, success, errorMessage);
    }

    @PrePersist
    void prePersist() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
        if (id == null || id.isBlank()) {
            id = IdGenerator.generateString();
        }
    }

    public String getId() {
        return id;
    }

    public String getEntityType() {
        return entityType;
    }

    public String getEntityId() {
        return entityId;
    }

    public String getAction() {
        return action;
    }

    public String getActor() {
        return actor;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public String getUserAgent() {
        return userAgent;
    }

    public Boolean getSuccess() {
        return success;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
