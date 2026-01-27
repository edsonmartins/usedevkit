package com.devkit.bootstrap.domain;

import com.devkit.applications.domain.ApplicationCommandService;
import com.devkit.applications.domain.CreateApplicationCmd;
import com.devkit.auth.security.ApiKeyAuthService;
import com.devkit.bootstrap.dto.BootstrapRequest;
import com.devkit.bootstrap.dto.BootstrapResponse;
import com.devkit.bootstrap.dto.BootstrapStatusResponse;
import com.devkit.multitenancy.domain.TenantEntity;
import com.devkit.multitenancy.domain.TenantRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service for initial system bootstrap.
 * Handles first-time setup of tenant, application, and API key.
 */
@Service
public class BootstrapService {

    private static final Logger log = LoggerFactory.getLogger(BootstrapService.class);

    private final TenantRepository tenantRepository;
    private final ApplicationCommandService applicationCommandService;
    private final ApiKeyAuthService apiKeyAuthService;

    public BootstrapService(
            TenantRepository tenantRepository,
            ApplicationCommandService applicationCommandService,
            ApiKeyAuthService apiKeyAuthService) {
        this.tenantRepository = tenantRepository;
        this.applicationCommandService = applicationCommandService;
        this.apiKeyAuthService = apiKeyAuthService;
    }

    /**
     * Check if the system needs initial setup.
     *
     * @return status response indicating if setup is needed
     */
    public BootstrapStatusResponse getStatus() {
        long tenantCount = tenantRepository.count();
        if (tenantCount == 0) {
            return BootstrapStatusResponse.requiresSetup();
        }
        return BootstrapStatusResponse.setupComplete();
    }

    /**
     * Perform initial system bootstrap.
     * Creates tenant, application, and generates API key.
     *
     * @param request the bootstrap request with org/app details
     * @return response containing the generated API key
     * @throws BootstrapException if system is already configured
     */
    @Transactional
    public BootstrapResponse bootstrap(BootstrapRequest request) {
        // Check if already bootstrapped
        if (tenantRepository.count() > 0) {
            throw new BootstrapException("System is already configured. Bootstrap can only run once.");
        }

        log.info("Starting system bootstrap for organization: {}", request.organizationName());

        // 1. Create Tenant
        String slug = generateSlug(request.organizationName());
        TenantEntity tenant = TenantEntity.create(
            request.organizationName(),
            slug,
            request.adminEmail()
        );
        tenant = tenantRepository.save(tenant);
        log.info("Created tenant: {} (ID: {})", tenant.getName(), tenant.getId());

        // 2. Create Application
        CreateApplicationCmd appCmd = new CreateApplicationCmd(
            request.applicationName(),
            "Default application created during setup",
            request.adminEmail()
        );
        String applicationId = applicationCommandService.createApplication(appCmd);
        log.info("Created application: {} (ID: {})", request.applicationName(), applicationId);

        // 3. Generate API Key
        String apiKey = apiKeyAuthService.generateApiKey(applicationId, "Initial Setup Key");
        log.info("Generated API key for application: {}", applicationId);

        log.info("Bootstrap completed successfully for organization: {}", request.organizationName());

        return BootstrapResponse.success(
            tenant.getId().toString(),
            tenant.getName(),
            applicationId,
            request.applicationName(),
            apiKey
        );
    }

    /**
     * Generate a URL-friendly slug from the organization name.
     */
    private String generateSlug(String name) {
        return name.toLowerCase()
            .replaceAll("[^a-z0-9\\s-]", "")
            .replaceAll("\\s+", "-")
            .replaceAll("-+", "-")
            .replaceAll("^-|-$", "");
    }
}
