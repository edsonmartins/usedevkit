package com.devkit.multitenancy.domain;

import com.devkit.shared.domain.AssertUtil;
import com.devkit.shared.domain.BaseEntity;
import jakarta.persistence.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * Represents a tenant (organization) in the multi-tenant system.
 * Each tenant has isolated data and configuration.
 */
@Entity
@Table(name = "tenants")
public class TenantEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "slug", nullable = false, unique = true, length = 100)
    private String slug; // Unique identifier for URLs

    @Column(name = "domain", length = 255)
    private String domain; // Custom domain (optional)

    @Column(name = "logo_url", columnDefinition = "TEXT")
    private String logoUrl;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "plan", length = 50)
    private TenantPlan plan = TenantPlan.FREE;

    @Column(name = "max_users", nullable = false)
    private Integer maxUsers = 5;

    @Column(name = "max_applications", nullable = false)
    private Integer maxApplications = 3;

    @Column(name = "max_configs_per_application", nullable = false)
    private Integer maxConfigsPerApplication = 100;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "trial_ends_at")
    private Instant trialEndsAt;

    @Column(name = "subscription_renews_at")
    private Instant subscriptionRenewsAt;

    @Column(name = "settings", columnDefinition = "TEXT")
    private String settings; // JSON with tenant-specific settings

    @Column(name = "created_by", length = 255)
    private String createdBy;

    // Associations
    @OneToMany(mappedBy = "tenant", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TenantUserEntity> users = new ArrayList<>();

    // Protected no-arg constructor for JPA
    protected TenantEntity() {}

    // Public constructor
    public TenantEntity(
            String name,
            String slug,
            String domain,
            String description,
            TenantPlan plan,
            Integer maxUsers,
            Integer maxApplications,
            String createdBy) {

        this.name = AssertUtil.requireNotBlank(name, "Tenant name cannot be null or empty");
        this.slug = AssertUtil.requireNotBlank(slug, "Tenant slug cannot be null or empty");
        this.domain = domain;
        this.description = description;
        this.plan = plan != null ? plan : TenantPlan.FREE;
        this.maxUsers = maxUsers != null ? maxUsers : 5;
        this.maxApplications = maxApplications != null ? maxApplications : 3;
        this.maxConfigsPerApplication = 100;
        this.isActive = true;
        this.createdBy = createdBy;
    }

    // Factory method
    public static TenantEntity create(
            String name,
            String slug,
            String createdBy) {

        return new TenantEntity(
            name,
            slug,
            null,
            null,
            TenantPlan.FREE,
            5,
            3,
            createdBy
        );
    }

    // Domain methods
    public void activate() {
        this.isActive = true;
    }

    public void deactivate() {
        this.isActive = false;
    }

    public void upgradePlan(TenantPlan newPlan, Integer newMaxUsers, Integer newMaxApps) {
        this.plan = newPlan;
        this.maxUsers = newMaxUsers;
        this.maxApplications = newMaxApps;
    }

    public boolean isTrialExpired() {
        return trialEndsAt != null && Instant.now().isAfter(trialEndsAt);
    }

    public boolean canAddUser() {
        Long currentCount = (long) users.size();
        return currentCount < maxUsers;
    }

    public boolean isWithinLimits(Integer applicationCount, Integer configCount) {
        boolean appsOk = applicationCount <= maxApplications;
        boolean configsOk = configCount <= maxConfigsPerApplication;
        return appsOk && configsOk;
    }

    // Getters
    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getSlug() {
        return slug;
    }

    public String getDomain() {
        return domain;
    }

    public String getLogoUrl() {
        return logoUrl;
    }

    public String getDescription() {
        return description;
    }

    public TenantPlan getPlan() {
        return plan;
    }

    public Integer getMaxUsers() {
        return maxUsers;
    }

    public Integer getMaxApplications() {
        return maxApplications;
    }

    public Integer getMaxConfigsPerApplication() {
        return maxConfigsPerApplication;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public Instant getTrialEndsAt() {
        return trialEndsAt;
    }

    public Instant getSubscriptionRenewsAt() {
        return subscriptionRenewsAt;
    }

    public String getSettings() {
        return settings;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public List<TenantUserEntity> getUsers() {
        return users;
    }

    // Setters
    public void setName(String name) {
        this.name = name;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public void setDomain(String domain) {
        this.domain = domain;
    }

    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setPlan(TenantPlan plan) {
        this.plan = plan;
    }

    public void setActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public void setTrialEndsAt(Instant trialEndsAt) {
        this.trialEndsAt = trialEndsAt;
    }

    public void setSubscriptionRenewsAt(Instant subscriptionRenewsAt) {
        this.subscriptionRenewsAt = subscriptionRenewsAt;
    }

    public void setSettings(String settings) {
        this.settings = settings;
    }

    public void setMaxUsers(Integer maxUsers) {
        this.maxUsers = maxUsers;
    }

    public void setMaxApplications(Integer maxApplications) {
        this.maxApplications = maxApplications;
    }

    public void setMaxConfigsPerApplication(Integer maxConfigsPerApplication) {
        this.maxConfigsPerApplication = maxConfigsPerApplication;
    }

    public enum TenantPlan {
        FREE,       // 5 users, 3 apps, 100 configs
        STARTER,    // 20 users, 10 apps, 1000 configs
        PROFESSIONAL, // 100 users, unlimited apps, 10000 configs
        ENTERPRISE  // Unlimited everything
    }
}
