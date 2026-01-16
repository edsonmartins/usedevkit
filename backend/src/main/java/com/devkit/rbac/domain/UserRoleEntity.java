package com.devkit.rbac.domain;

import com.devkit.shared.domain.AssertUtil;
import com.devkit.shared.domain.BaseEntity;
import jakarta.persistence.*;

import java.time.Instant;

/**
 * Represents the assignment of a role to a user within a tenant.
 */
@Entity
@Table(name = "user_roles")
public class UserRoleEntity extends BaseEntity {

    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;

    @Column(name = "user_id", nullable = false, length = 255)
    private String userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id", nullable = false)
    private RoleEntity role;

    @Column(name = "granted_by", length = 255)
    private String grantedBy;

    @Column(name = "granted_at", nullable = false)
    private Instant grantedAt;

    @Column(name = "expires_at")
    private Instant expiresAt;

    @Column(name = "reason", columnDefinition = "TEXT")
    private String reason;

    // Protected no-arg constructor for JPA
    protected UserRoleEntity() {}

    // Public constructor
    public UserRoleEntity(
            Long tenantId,
            String userId,
            RoleEntity role,
            String grantedBy,
            Instant expiresAt,
            String reason) {

        this.tenantId = AssertUtil.requireNotNull(tenantId, "Tenant ID cannot be null");
        this.userId = AssertUtil.requireNotBlank(userId, "User ID cannot be null or empty");
        this.role = AssertUtil.requireNotNull(role, "Role cannot be null");
        this.grantedBy = grantedBy;
        this.grantedAt = Instant.now();
        this.expiresAt = expiresAt;
        this.reason = reason;
    }

    // Factory method
    public static UserRoleEntity create(
            Long tenantId,
            String userId,
            RoleEntity role,
            String grantedBy) {

        return new UserRoleEntity(
            tenantId,
            userId,
            role,
            grantedBy,
            null,
            null
        );
    }

    // Domain methods
    public boolean isExpired() {
        return expiresAt != null && Instant.now().isAfter(expiresAt);
    }

    public boolean isValid() {
        return !isExpired();
    }

    // Getters
    public Long getTenantId() {
        return tenantId;
    }

    public String getUserId() {
        return userId;
    }

    public RoleEntity getRole() {
        return role;
    }

    public String getGrantedBy() {
        return grantedBy;
    }

    public Instant getGrantedAt() {
        return grantedAt;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public String getReason() {
        return reason;
    }

    // Setters
    public void setRole(RoleEntity role) {
        this.role = role;
    }

    public void setExpiresAt(Instant expiresAt) {
        this.expiresAt = expiresAt;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public void setTenantId(Long tenantId) {
        this.tenantId = tenantId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public void setGrantedBy(String grantedBy) {
        this.grantedBy = grantedBy;
    }

    public void setGrantedAt(Instant grantedAt) {
        this.grantedAt = grantedAt;
    }
}
