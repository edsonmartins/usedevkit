package com.devkit.multitenancy.domain;

import com.devkit.shared.domain.AssertUtil;
import com.devkit.shared.domain.BaseEntity;
import jakarta.persistence.*;

import java.time.Instant;

/**
 * Represents a user's membership in a tenant with specific roles.
 */
@Entity
@Table(name = "tenant_users")
public class TenantUserEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private TenantEntity tenant;

    @Column(name = "user_id", nullable = false, length = 255)
    private String userId; // External user ID (from auth system)

    @Column(name = "email", nullable = false, length = 255)
    private String email;

    @Column(name = "name", length = 255)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 50)
    private TenantRole role = TenantRole.MEMBER;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "invited_by", length = 255)
    private String invitedBy;

    @Column(name = "invited_at")
    private Instant invitedAt;

    @Column(name = "joined_at")
    private Instant joinedAt;

    // Protected no-arg constructor for JPA
    protected TenantUserEntity() {}

    // Public constructor
    public TenantUserEntity(
            TenantEntity tenant,
            String userId,
            String email,
            String name,
            TenantRole role,
            String invitedBy) {

        this.tenant = AssertUtil.requireNotNull(tenant, "Tenant cannot be null");
        this.userId = AssertUtil.requireNotBlank(userId, "User ID cannot be null or empty");
        this.email = AssertUtil.requireNotBlank(email, "Email cannot be null or empty");
        this.name = name;
        this.role = role != null ? role : TenantRole.MEMBER;
        this.invitedBy = invitedBy;
        this.isActive = true;
        this.invitedAt = Instant.now();
    }

    // Factory method
    public static TenantUserEntity create(
            TenantEntity tenant,
            String userId,
            String email,
            String name,
            String invitedBy) {

        return new TenantUserEntity(
            tenant,
            userId,
            email,
            name,
            TenantRole.MEMBER,
            invitedBy
        );
    }

    // Domain methods
    public void join() {
        this.joinedAt = Instant.now();
    }

    public void leave() {
        this.isActive = false;
    }

    public void changeRole(TenantRole newRole, String changedBy) {
        this.role = newRole;
        // TODO: Log role change
    }

    public boolean isOwner() {
        return role == TenantRole.OWNER;
    }

    public boolean isAdmin() {
        return role == TenantRole.OWNER || role == TenantRole.ADMIN;
    }

    public boolean canManageUsers() {
        return isAdmin();
    }

    public boolean canManageBilling() {
        return role == TenantRole.OWNER;
    }

    // Getters
    public Long getId() {
        return id;
    }

    public TenantEntity getTenant() {
        return tenant;
    }

    public String getUserId() {
        return userId;
    }

    public String getEmail() {
        return email;
    }

    public String getName() {
        return name;
    }

    public TenantRole getRole() {
        return role;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public String getInvitedBy() {
        return invitedBy;
    }

    public Instant getInvitedAt() {
        return invitedAt;
    }

    public Instant getJoinedAt() {
        return joinedAt;
    }

    // Setters
    public void setTenant(TenantEntity tenant) {
        this.tenant = tenant;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setRole(TenantRole role) {
        this.role = role;
    }

    public void setActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public void setInvitedBy(String invitedBy) {
        this.invitedBy = invitedBy;
    }

    public void setInvitedAt(Instant invitedAt) {
        this.invitedAt = invitedAt;
    }

    public void setJoinedAt(Instant joinedAt) {
        this.joinedAt = joinedAt;
    }

    public enum TenantRole {
        OWNER,       // Full control, billing access
        ADMIN,       // Manage users, settings, configurations
        MEMBER,      // Read/write configurations
        VIEWER       // Read-only configurations
    }
}
