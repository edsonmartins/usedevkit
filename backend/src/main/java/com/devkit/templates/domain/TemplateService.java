package com.devkit.templates.domain;

import com.devkit.shared.domain.ResourceNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service for managing configuration templates with versioning.
 */
@Service
@Transactional
public class TemplateService {

    private static final Logger logger = LoggerFactory.getLogger(TemplateService.class);

    private final TemplateRepository templateRepository;

    public TemplateService(TemplateRepository templateRepository) {
        this.templateRepository = templateRepository;
    }

    // ==================== Template Management ====================

    /**
     * Create a new template.
     */
    public String createTemplate(
            String name,
            String description,
            String category,
            List<String> tags,
            String schema,
            String defaultValues,
            String validationRules,
            String createdBy) {

        // Check if template name already exists
        if (templateRepository.findByName(name).isPresent()) {
            throw new IllegalArgumentException("Template name already exists: " + name);
        }

        TemplateEntity template = TemplateEntity.create(
            name,
            description,
            category,
            tags != null ? String.join(",", tags) : null,
            createdBy
        );

        templateRepository.save(template);

        // Create initial version
        TemplateVersionEntity version = template.createVersion(
            schema,
            defaultValues,
            validationRules,
            createdBy
        );

        templateRepository.save(template);

        logger.info("Created template: {} with initial version: {}", name, template.getCurrentVersion());

        return template.getId();
    }

    /**
     * Update template (creates new version).
     */
    public void updateTemplate(
            String templateId,
            String description,
            List<String> tags,
            String schema,
            String defaultValues,
            String validationRules,
            String changeDescription,
            String createdBy) {

        TemplateEntity template = getTemplate(templateId);

        // Mark previous version as not current
        template.getVersions().stream()
            .filter(TemplateVersionEntity::getIsCurrent)
            .forEach(v -> v.markAsPrevious());

        // Increment version
        template.incrementVersion();

        // Create new version
        TemplateVersionEntity newVersion = template.createVersion(
            schema,
            defaultValues,
            validationRules,
            createdBy
        );
        newVersion.setChangeDescription(changeDescription);

        // Update template metadata
        template.setDescription(description);
        template.setTags(tags != null ? String.join(",", tags) : null);

        templateRepository.save(template);

        logger.info("Updated template: {} to version: {}", template.getName(), template.getCurrentVersion());
    }

    /**
     * Activate a template.
     */
    public void activateTemplate(String templateId) {
        TemplateEntity template = getTemplate(templateId);
        template.activate();
        templateRepository.save(template);

        logger.info("Activated template: {}", template.getName());
    }

    /**
     * Deactivate a template.
     */
    public void deactivateTemplate(String templateId) {
        TemplateEntity template = getTemplate(templateId);
        template.deactivate();
        templateRepository.save(template);

        logger.info("Deactivated template: {}", template.getName());
    }

    /**
     * Delete a template.
     */
    public void deleteTemplate(String templateId) {
        TemplateEntity template = getTemplate(templateId);
        templateRepository.delete(template);

        logger.info("Deleted template: {}", template.getName());
    }

    // ==================== Blueprint Application ====================

    /**
     * Apply template defaults to generate configuration values.
     */
    public Map<String, Object> applyTemplate(String templateId, Map<String, Object> overrides) {
        TemplateEntity template = getTemplateWithVersions(templateId);

        TemplateVersionEntity currentVersion = template.getVersions().stream()
            .filter(TemplateVersionEntity::getIsCurrent)
            .findFirst()
            .orElseThrow(() -> new IllegalStateException("No current version found for template: " + templateId));

        // TODO: Parse defaultValues JSON and merge with overrides
        // For now, return a simple map
        return Map.of(
            "templateName", template.getName(),
            "version", currentVersion.getVersion(),
            "hasDefaults", currentVersion.getDefaultValues() != null,
            "overrides", overrides
        );
    }

    /**
     * Validate configuration against template rules.
     */
    public boolean validateAgainstTemplate(String templateId, Map<String, Object> config) {
        TemplateEntity template = getTemplateWithVersions(templateId);

        TemplateVersionEntity currentVersion = template.getVersions().stream()
            .filter(TemplateVersionEntity::getIsCurrent)
            .findFirst()
            .orElseThrow(() -> new IllegalStateException("No current version found for template: " + templateId));

        // TODO: Implement validation logic based on validationRules JSON
        // For now, just check if config is not null
        return config != null && !config.isEmpty();
    }

    // ==================== Query Methods ====================

    public TemplateEntity getTemplate(String templateId) {
        return templateRepository.findById(templateId)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Template not found: " + templateId
            ));
    }

    public TemplateEntity getTemplateWithVersions(String templateId) {
        return templateRepository.findByIdWithVersions(templateId)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Template not found: " + templateId
            ));
    }

    public List<TemplateEntity> getAllTemplates() {
        return templateRepository.findAll();
    }

    public List<TemplateEntity> getActiveTemplates() {
        return templateRepository.findByIsActive(true);
    }

    public List<TemplateEntity> getTemplatesByCategory(String category) {
        return templateRepository.findByCategory(category);
    }

    public TemplateEntity getTemplateByName(String name) {
        return templateRepository.findByName(name)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Template not found: " + name
            ));
    }

    public TemplateStatsDTO getStatistics() {
        long activeCount = templateRepository.countByIsActive(true);
        long inactiveCount = templateRepository.countByIsActive(false);

        return new TemplateStatsDTO(
            activeCount,
            inactiveCount
        );
    }

    // ==================== Record Classes ====================

    public record TemplateStatsDTO(
        long activeTemplates,
        long inactiveTemplates
    ) {}
}
