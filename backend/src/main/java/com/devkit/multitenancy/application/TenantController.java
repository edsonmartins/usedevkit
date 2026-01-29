package com.devkit.multitenancy.application;

import com.devkit.multitenancy.domain.TenantEntity;
import com.devkit.multitenancy.domain.TenantService;
import com.devkit.rbac.dto.CreateTenantDTO;
import com.devkit.rbac.dto.TenantDTO;
import com.devkit.rbac.dto.UpdateTenantDTO;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * REST controller for tenant management.
 */
@RestController
@RequestMapping("/api/v1/tenants")
public class TenantController {

    private final TenantService tenantService;

    public TenantController(TenantService tenantService) {
        this.tenantService = tenantService;
    }

    /**
     * Create a new tenant.
     * POST /api/v1/tenants
     */
    @PostMapping
    public ResponseEntity<TenantDTO> createTenant(@Valid @RequestBody CreateTenantDTO dto) {
        TenantDTO tenant = tenantService.createTenant(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(tenant);
    }

    /**
     * Get all tenants.
     * GET /api/v1/tenants
     */
    @GetMapping
    public ResponseEntity<List<TenantDTO>> getAllTenants() {
        List<TenantDTO> tenants = tenantService.getAllTenants();
        return ResponseEntity.ok(tenants);
    }

    /**
     * Get active tenants.
     * GET /api/v1/tenants/active
     */
    @GetMapping("/active")
    public ResponseEntity<List<TenantDTO>> getActiveTenants() {
        List<TenantDTO> tenants = tenantService.getActiveTenants();
        return ResponseEntity.ok(tenants);
    }

    /**
     * Get tenant by ID.
     * GET /api/v1/tenants/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<TenantDTO> getTenantById(@PathVariable Long id) {
        TenantDTO tenant = tenantService.getTenantById(id);
        return ResponseEntity.ok(tenant);
    }

    /**
     * Get tenant by slug.
     * GET /api/v1/tenants/slug/{slug}
     */
    @GetMapping("/slug/{slug}")
    public ResponseEntity<TenantDTO> getTenantBySlug(@PathVariable String slug) {
        TenantDTO tenant = tenantService.getTenantBySlug(slug);
        return ResponseEntity.ok(tenant);
    }

    /**
     * Update tenant.
     * PUT /api/v1/tenants/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<TenantDTO> updateTenant(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTenantDTO dto) {
        TenantDTO tenant = tenantService.updateTenant(id, dto);
        return ResponseEntity.ok(tenant);
    }

    /**
     * Activate tenant.
     * POST /api/v1/tenants/{id}/activate
     */
    @PostMapping("/{id}/activate")
    public ResponseEntity<Void> activateTenant(@PathVariable Long id) {
        tenantService.activateTenant(id);
        return ResponseEntity.ok().build();
    }

    /**
     * Deactivate tenant.
     * POST /api/v1/tenants/{id}/deactivate
     */
    @PostMapping("/{id}/deactivate")
    public ResponseEntity<Void> deactivateTenant(@PathVariable Long id) {
        tenantService.deactivateTenant(id);
        return ResponseEntity.ok().build();
    }

    /**
     * Suspend tenant (alias to deactivate).
     */
    @PostMapping("/{id}/suspend")
    public ResponseEntity<Void> suspendTenant(@PathVariable Long id) {
        tenantService.deactivateTenant(id);
        return ResponseEntity.ok().build();
    }

    /**
     * Upgrade tenant plan.
     * POST /api/v1/tenants/{id}/upgrade
     */
    @PostMapping("/{id}/upgrade")
    public ResponseEntity<TenantDTO> upgradePlan(
            @PathVariable Long id,
            @RequestParam TenantEntity.TenantPlan plan) {
        TenantDTO tenant = tenantService.upgradePlan(id, plan);
        return ResponseEntity.ok(tenant);
    }

    /**
     * Get tenant statistics.
     * GET /api/v1/tenants/{id}/stats
     */
    @GetMapping("/{id}/stats")
    public ResponseEntity<TenantDTO> getTenantStats(@PathVariable Long id) {
        TenantDTO tenant = tenantService.getTenantStats(id);
        return ResponseEntity.ok(tenant);
    }

    /**
     * Delete tenant.
     * DELETE /api/v1/tenants/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTenant(@PathVariable Long id) {
        tenantService.deleteTenant(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Get overall tenant statistics.
     * GET /api/v1/tenants/stats
     */
    @GetMapping("/stats")
    public ResponseEntity<TenantStatsDTO> getTenantStats() {
        List<TenantDTO> tenants = tenantService.getAllTenants();

        long total = tenants.size();
        long active = tenants.stream().filter(TenantDTO::isActive).count();
        long trial = tenants.stream().filter(t -> t.trialEndsAt() != null && t.isActive()).count();
        long suspended = tenants.stream().filter(t -> !t.isActive()).count();
        long cancelled = 0;

        Map<String, Long> tenantsByPlan = tenants.stream()
            .collect(Collectors.groupingBy(TenantDTO::plan, Collectors.counting()));

        return ResponseEntity.ok(new TenantStatsDTO(
            total,
            active,
            trial,
            suspended,
            cancelled,
            tenantsByPlan
        ));
    }

    public record TenantStatsDTO(
        long totalTenants,
        long activeTenants,
        long trialTenants,
        long suspendedTenants,
        long cancelledTenants,
        Map<String, Long> tenantsByPlan
    ) {}
}
