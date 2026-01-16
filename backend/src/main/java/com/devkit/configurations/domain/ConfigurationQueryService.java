package com.devkit.configurations.domain;

import com.devkit.shared.domain.ResourceNotFoundException;
import com.devkit.configurations.domain.vo.ConfigurationId;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Query Service for Configuration read operations.
 */
@Service
@Transactional(readOnly = true)
public class ConfigurationQueryService {

    private final ConfigurationRepository configurationRepository;

    ConfigurationQueryService(ConfigurationRepository configurationRepository) {
        this.configurationRepository = configurationRepository;
    }

    /**
     * Get all configurations for an environment.
     * @param environmentId the environment ID
     * @return list of configuration results
     */
    public List<ConfigurationResult> getConfigurationsByEnvironment(String environmentId) {
        return configurationRepository.findByEnvironmentId(environmentId)
                .stream()
                .map(ConfigurationResult::from)
                .collect(Collectors.toList());
    }

    /**
     * Get configuration by ID.
     * @param configurationId the configuration ID
     * @return the configuration result
     */
    public ConfigurationResult getConfigurationById(String configurationId) {
        return configurationRepository.findById(ConfigurationId.of(configurationId))
                .map(ConfigurationResult::from)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Configuration not found with id: " + configurationId));
    }

    /**
     * Get configuration by environment and key.
     * @param environmentId the environment ID
     * @param key the configuration key
     * @return the configuration result
     */
    public ConfigurationResult getConfigurationByEnvironmentAndKey(String environmentId, String key) {
        return ConfigurationResult.from(
                configurationRepository.getByEnvironmentIdAndKey(environmentId, key)
        );
    }

    /**
     * Get non-secret configurations for an environment.
     * @param environmentId the environment ID
     * @return list of non-secret configuration results
     */
    public List<ConfigurationResult> getNonSecretConfigurations(String environmentId) {
        return configurationRepository.findNonSecretByEnvironmentId(environmentId)
                .stream()
                .map(ConfigurationResult::from)
                .collect(Collectors.toList());
    }

    /**
     * Get secret configurations for an environment.
     * @param environmentId the environment ID
     * @return list of secret configuration results
     */
    public List<ConfigurationResult> getSecretConfigurations(String environmentId) {
        return configurationRepository.findSecretsByEnvironmentId(environmentId)
                .stream()
                .map(ConfigurationResult::from)
                .collect(Collectors.toList());
    }

    /**
     * Get all configurations as a map (for SDK consumption).
     * @param environmentId the environment ID
     * @return map of configuration key to value
     */
    public java.util.Map<String, String> getConfigurationMap(String environmentId) {
        return configurationRepository.findByEnvironmentId(environmentId)
                .stream()
                .collect(Collectors.toMap(
                        ConfigurationEntity::getKey,
                        ConfigurationEntity::getValue
                ));
    }

    /**
     * Get all non-secret configurations as a map (for SDK consumption).
     * @param environmentId the environment ID
     * @return map of configuration key to value (excluding secrets)
     */
    public java.util.Map<String, String> getNonSecretConfigurationMap(String environmentId) {
        return configurationRepository.findNonSecretByEnvironmentId(environmentId)
                .stream()
                .collect(Collectors.toMap(
                        ConfigurationEntity::getKey,
                        ConfigurationEntity::getValue
                ));
    }
}
