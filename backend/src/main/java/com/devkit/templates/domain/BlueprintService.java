package com.devkit.templates.domain;

import com.devkit.shared.domain.ResourceNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Service for managing application blueprints composed of templates.
 */
@Service
@Transactional
public class BlueprintService {

    private static final Logger logger = LoggerFactory.getLogger(BlueprintService.class);

    private final BlueprintRepository blueprintRepository;
    private final TemplateRepository templateRepository;

    public BlueprintService(
            BlueprintRepository blueprintRepository,
            TemplateRepository templateRepository) {
        this.blueprintRepository = blueprintRepository;
        this.templateRepository = templateRepository;
    }

    // ==================== Blueprint Management ====================

    /**
     * Create a new blueprint.
     */
    public Long createBlueprint(
            String name,
            String description,
            String applicationId,
            String createdBy) {

        BlueprintEntity blueprint = BlueprintEntity.create(
            name,
            description,
            applicationId,
            createdBy
        );

        BlueprintEntity saved = blueprintRepository.save(blueprint);

        logger.info("Created blueprint: {} for application: {}", name, applicationId);

        return saved.getId();
    }

    /**
     * Update a blueprint.
     */
    public void updateBlueprint(
            Long blueprintId,
            String name,
            String description) {

        BlueprintEntity blueprint = getBlueprint(blueprintId);

        blueprint.setName(name);
        blueprint.setDescription(description);

        blueprintRepository.save(blueprint);

        logger.info("Updated blueprint: {}", name);
    }

    /**
     * Activate a blueprint.
     */
    public void activateBlueprint(Long blueprintId) {
        BlueprintEntity blueprint = getBlueprint(blueprintId);
        blueprint.activate();
        blueprintRepository.save(blueprint);

        logger.info("Activated blueprint: {}", blueprint.getName());
    }

    /**
     * Deactivate a blueprint.
     */
    public void deactivateBlueprint(Long blueprintId) {
        BlueprintEntity blueprint = getBlueprint(blueprintId);
        blueprint.deactivate();
        blueprintRepository.save(blueprint);

        logger.info("Deactivated blueprint: {}", blueprint.getName());
    }

    /**
     * Delete a blueprint.
     */
    public void deleteBlueprint(Long blueprintId) {
        BlueprintEntity blueprint = getBlueprint(blueprintId);
        blueprintRepository.delete(blueprint);

        logger.info("Deleted blueprint: {}", blueprint.getName());
    }

    // ==================== Config Management ====================

    /**
     * Add config to blueprint with template inheritance.
     */
    public void addConfigWithTemplate(
            Long blueprintId,
            String configKey,
            Long templateId,
            String valueOverride) {

        BlueprintEntity blueprint = getBlueprint(blueprintId);

        // Verify template exists
        TemplateEntity template = templateRepository.findById(templateId)
            .orElseThrow(() -> new IllegalArgumentException(
                "Template not found: " + templateId
            ));

        BlueprintConfigEntity config = BlueprintConfigEntity.createWithTemplate(
            blueprint,
            configKey,
            templateId,
            valueOverride
        );

        blueprint.addConfig(config);
        blueprintRepository.save(blueprint);

        logger.info("Added config: {} to blueprint: {} with template: {}",
            configKey, blueprint.getName(), template.getName());
    }

    /**
     * Add config to blueprint without template.
     */
    public void addConfigWithoutTemplate(
            Long blueprintId,
            String configKey,
            String value,
            Boolean isRequired) {

        BlueprintEntity blueprint = getBlueprint(blueprintId);

        BlueprintConfigEntity config = BlueprintConfigEntity.createWithoutTemplate(
            blueprint,
            configKey,
            value,
            isRequired
        );

        blueprint.addConfig(config);
        blueprintRepository.save(blueprint);

        logger.info("Added config: {} to blueprint: {} (no template)",
            configKey, blueprint.getName());
    }

    /**
     * Remove config from blueprint.
     */
    public void removeConfig(Long blueprintId, Long configId) {
        BlueprintEntity blueprint = getBlueprintWithConfigs(blueprintId);

        BlueprintConfigEntity config = blueprint.getConfigs().stream()
            .filter(c -> c.getId().equals(configId))
            .findFirst()
            .orElseThrow(() -> new ResourceNotFoundException(
                "Config not found: " + configId
            ));

        blueprint.removeConfig(config);
        blueprintRepository.save(blueprint);

        logger.info("Removed config: {} from blueprint: {}",
            config.getConfigKey(), blueprint.getName());
    }

    /**
     * Update config value override.
     */
    public void updateConfigOverride(Long blueprintId, Long configId, String newValue) {
        BlueprintEntity blueprint = getBlueprintWithConfigs(blueprintId);

        BlueprintConfigEntity config = blueprint.getConfigs().stream()
            .filter(c -> c.getId().equals(configId))
            .findFirst()
            .orElseThrow(() -> new ResourceNotFoundException(
                "Config not found: " + configId
            ));

        config.setValueOverride(newValue);
        blueprintRepository.save(blueprint);

        logger.info("Updated config: {} in blueprint: {}",
            config.getConfigKey(), blueprint.getName());
    }

    // ==================== Blueprint Generation ====================

    /**
     * Generate full configuration map from blueprint.
     * Merges template defaults with blueprint overrides.
     */
    public Map<String, Object> generateConfiguration(Long blueprintId) {
        BlueprintEntity blueprint = getBlueprintWithConfigs(blueprintId);

        Map<String, Object> config = new java.util.HashMap<>();

        for (BlueprintConfigEntity blueprintConfig : blueprint.getConfigs()) {
            String key = blueprintConfig.getConfigKey();

            if (blueprintConfig.hasTemplate()) {
                // Apply template with override
                TemplateEntity template = templateRepository.findById(blueprintConfig.getTemplateId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                        "Template not found: " + blueprintConfig.getTemplateId()
                    ));

                Map<String, Object> templateDefaults = Map.of(
                    "template", template.getName(),
                    "version", template.getCurrentVersion()
                );

                if (blueprintConfig.hasOverride()) {
                    config.put(key, blueprintConfig.getValueOverride());
                } else {
                    config.put(key, templateDefaults);
                }
            } else {
                // Use blueprint value directly
                config.put(key, blueprintConfig.getValueOverride());
            }
        }

        return config;
    }

    /**
     * Validate blueprint configuration.
     */
    public BlueprintValidationResult validateBlueprint(Long blueprintId) {
        BlueprintEntity blueprint = getBlueprintWithConfigs(blueprintId);

        List<String> errors = new ArrayList<>();
        List<String> warnings = new ArrayList<>();

        for (BlueprintConfigEntity config : blueprint.getConfigs()) {
            // Check required configs have values
            if (config.getIsRequired() && !config.hasOverride()) {
                if (!config.hasTemplate()) {
                    errors.add("Required config missing value: " + config.getConfigKey());
                }
            }

            // Validate template exists
            if (config.hasTemplate()) {
                if (!templateRepository.existsById(config.getTemplateId())) {
                    errors.add("Template not found for config: " + config.getConfigKey());
                }
            }
        }

        boolean isValid = errors.isEmpty();

        return new BlueprintValidationResult(
            isValid,
            errors,
            warnings,
            blueprint.getConfigs().size()
        );
    }

    // ==================== Query Methods ====================

    public BlueprintEntity getBlueprint(Long blueprintId) {
        return blueprintRepository.findById(blueprintId)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Blueprint not found: " + blueprintId
            ));
    }

    public BlueprintEntity getBlueprintWithConfigs(Long blueprintId) {
        return blueprintRepository.findByIdWithConfigs(blueprintId)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Blueprint not found: " + blueprintId
            ));
    }

    public List<BlueprintEntity> getAllBlueprints() {
        return blueprintRepository.findAll();
    }

    public List<BlueprintEntity> getActiveBlueprints() {
        return blueprintRepository.findByIsActive(true);
    }

    public List<BlueprintEntity> getBlueprintsByApplication(String applicationId) {
        return blueprintRepository.findByApplicationId(applicationId);
    }

    public BlueprintStatsDTO getStatistics() {
        long activeCount = blueprintRepository.countByIsActive(true);
        long inactiveCount = blueprintRepository.countByIsActive(false);

        return new BlueprintStatsDTO(
            activeCount,
            inactiveCount
        );
    }

    // ==================== Record Classes ====================

    public record BlueprintValidationResult(
        boolean isValid,
        List<String> errors,
        List<String> warnings,
        int totalConfigs
    ) {}

    public record BlueprintStatsDTO(
        long activeBlueprints,
        long inactiveBlueprints
    ) {}
}
