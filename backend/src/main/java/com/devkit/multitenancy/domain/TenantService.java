package com.devkit.multitenancy.domain;

import com.devkit.rbac.dto.CreateTenantDTO;
import com.devkit.rbac.dto.TenantDTO;
import com.devkit.rbac.dto.UpdateTenantDTO;
import com.devkit.shared.domain.ResourceNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for managing tenants.
 */
@Service
@Transactional
public class TenantService {

    private static final Logger logger = LoggerFactory.getLogger(TenantService.class);

    private final TenantRepository tenantRepository;
    private final TenantUserRepository tenantUserRepository;

    private static final int TRIAL_DAYS = 14;

    public TenantService(
            TenantRepository tenantRepository,
            TenantUserRepository tenantUserRepository) {
        this.tenantRepository = tenantRepository;
        this.tenantUserRepository = tenantUserRepository;
    }

    /**
     * Create a new tenant.
     */
    public TenantDTO createTenant(CreateTenantDTO dto) {
        // Check if slug already exists
        if (tenantRepository.existsBySlug(dto.slug())) {
            throw new IllegalArgumentException("Tenant slug already exists: " + dto.slug());
        }

        // Create tenant
        TenantEntity tenant = new TenantEntity(
            dto.name(),
            dto.slug(),
            null,
            dto.description(),
            mapPlan(dto.plan()),
            getMaxUsersForPlan(dto.plan()),
            getMaxApplicationsForPlan(dto.plan()),
            dto.ownerEmail()
        );

        tenant.setLogoUrl(dto.logoUrl());
        tenant.setTrialEndsAt(Instant.now().plus(Duration.ofDays(TRIAL_DAYS)));

        TenantEntity saved = tenantRepository.save(tenant);

        logger.info("Created tenant: {} with plan: {}", saved.getSlug(), saved.getPlan());

        return mapToDTO(saved);
    }

    /**
     * Get tenant by ID.
     */
    public TenantDTO getTenantById(Long id) {
        TenantEntity tenant = getTenant(id);
        return mapToDTO(tenant);
    }

    /**
     * Get tenant by slug.
     */
    public TenantDTO getTenantBySlug(String slug) {
        TenantEntity tenant = tenantRepository.findBySlug(slug)
            .orElseThrow(() -> new ResourceNotFoundException("Tenant not found: " + slug));
        return mapToDTO(tenant);
    }

    /**
     * Get all tenants.
     */
    public List<TenantDTO> getAllTenants() {
        return tenantRepository.findAll()
            .stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    /**
     * Get all active tenants.
     */
    public List<TenantDTO> getActiveTenants() {
        return tenantRepository.findByIsActiveTrue()
            .stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    /**
     * Update tenant.
     */
    public TenantDTO updateTenant(Long id, UpdateTenantDTO dto) {
        TenantEntity tenant = getTenant(id);

        if (dto.name() != null) {
            tenant.setName(dto.name());
        }
        if (dto.description() != null) {
            tenant.setDescription(dto.description());
        }
        if (dto.logoUrl() != null) {
            tenant.setLogoUrl(dto.logoUrl());
        }
        if (dto.website() != null) {
            tenant.setDomain(dto.website());
        }
        if (dto.industry() != null) {
            tenant.setSettings(dto.industry());
        }

        TenantEntity updated = tenantRepository.save(tenant);

        logger.info("Updated tenant: {}", updated.getSlug());

        return mapToDTO(updated);
    }

    /**
     * Activate tenant.
     */
    public void activateTenant(Long id) {
        TenantEntity tenant = getTenant(id);
        tenant.activate();
        tenantRepository.save(tenant);
        logger.info("Activated tenant: {}", tenant.getSlug());
    }

    /**
     * Deactivate tenant.
     */
    public void deactivateTenant(Long id) {
        TenantEntity tenant = getTenant(id);
        tenant.deactivate();
        tenantRepository.save(tenant);
        logger.info("Deactivated tenant: {}", tenant.getSlug());
    }

    /**
     * Upgrade tenant plan.
     */
    public TenantDTO upgradePlan(Long id, TenantEntity.TenantPlan newPlan) {
        TenantEntity tenant = getTenant(id);

        Integer newMaxUsers = getMaxUsersForPlan(newPlan);
        Integer newMaxApps = getMaxApplicationsForPlan(newPlan);

        tenant.upgradePlan(newPlan, newMaxUsers, newMaxApps);

        TenantEntity updated = tenantRepository.save(tenant);

        logger.info("Upgraded tenant {} to plan: {}", updated.getSlug(), newPlan);

        return mapToDTO(updated);
    }

    /**
     * Delete tenant.
     */
    public void deleteTenant(Long id) {
        TenantEntity tenant = getTenant(id);
        tenantRepository.delete(tenant);
        logger.info("Deleted tenant: {}", tenant.getSlug());
    }

    /**
     * Get tenant statistics.
     */
    public TenantDTO getTenantStats(Long id) {
        TenantEntity tenant = getTenant(id);
        return mapToDTOWithStats(tenant);
    }

    // ==================== Helper Methods ====================

    private TenantEntity getTenant(Long id) {
        return tenantRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Tenant not found: " + id));
    }

    private TenantEntity.TenantPlan mapPlan(CreateTenantDTO.TenantPlanDTO dto) {
        return switch (dto) {
            case FREE -> TenantEntity.TenantPlan.FREE;
            case STARTER -> TenantEntity.TenantPlan.STARTER;
            case PROFESSIONAL -> TenantEntity.TenantPlan.PROFESSIONAL;
            case ENTERPRISE -> TenantEntity.TenantPlan.ENTERPRISE;
        };
    }

    private Integer getMaxUsersForPlan(CreateTenantDTO.TenantPlanDTO plan) {
        return switch (plan) {
            case FREE -> 5;
            case STARTER -> 20;
            case PROFESSIONAL -> 100;
            case ENTERPRISE -> Integer.MAX_VALUE;
        };
    }

    private Integer getMaxApplicationsForPlan(CreateTenantDTO.TenantPlanDTO plan) {
        return switch (plan) {
            case FREE -> 3;
            case STARTER -> 10;
            case PROFESSIONAL -> Integer.MAX_VALUE;
            case ENTERPRISE -> Integer.MAX_VALUE;
        };
    }

    private TenantDTO mapToDTO(TenantEntity entity) {
        Integer userCount = tenantUserRepository.countByTenantId(entity.getId());

        return new TenantDTO(
            entity.getId(),
            entity.getName(),
            entity.getSlug(),
            entity.getDescription(),
            entity.getCreatedBy(),
            entity.getPlan().name(),
            entity.getIsActive(),
            entity.getLogoUrl(),
            entity.getDomain(),
            entity.getSettings(),
            null, // employeeCount
            null, // billingAddress
            null, // taxId
            entity.getMaxUsers(),
            entity.getMaxApplications(),
            entity.getMaxConfigsPerApplication(),
            entity.getMaxApplications() == Integer.MAX_VALUE,
            userCount,
            null, // applicationCount
            null, // configCount
            entity.getTrialEndsAt(),
            entity.getTrialEndsAt() != null ?
                (int) Duration.between(Instant.now(), entity.getTrialEndsAt()).toDays() : null,
            entity.getCreatedAt(),
            entity.getUpdatedAt(),
            entity.getSubscriptionRenewsAt()
        );
    }

    private TenantDTO mapToDTOWithStats(TenantEntity entity) {
        // TODO: Implement actual statistics gathering
        return mapToDTO(entity);
    }
}
