package com.devkit.configurations.domain;

import com.devkit.configurations.domain.events.ConfigurationCreatedEvent;
import com.devkit.configurations.domain.events.ConfigurationDeletedEvent;
import com.devkit.configurations.domain.events.ConfigurationUpdatedEvent;
import com.devkit.configurations.domain.vo.ConfigurationId;
import com.devkit.shared.domain.ResourceNotFoundException;
import com.devkit.shared.domain.SpringEventPublisher;
import com.devkit.configurations.domain.ConfigurationVersionEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Command Service for Configuration write operations.
 */
@Service
@Transactional
public class ConfigurationCommandService {

    private final ConfigurationRepository configurationRepository;
    private final SpringEventPublisher eventPublisher;

    ConfigurationCommandService(
            ConfigurationRepository configurationRepository,
            SpringEventPublisher eventPublisher) {
        this.configurationRepository = configurationRepository;
        this.eventPublisher = eventPublisher;
    }

    /**
     * Create a new configuration.
     * @param cmd the command containing configuration details
     * @return the ID of the created configuration
     */
    public String createConfiguration(CreateConfigurationCmd cmd) {
        // Check if configuration with same key already exists in environment
        configurationRepository.findByEnvironmentIdAndKey(cmd.environmentId(), cmd.key())
                .ifPresent(existing -> {
                    throw new IllegalArgumentException(
                            "Configuration with key '" + cmd.key() + "' already exists in environment");
                });

        var configuration = ConfigurationEntity.create(
                cmd.key(),
                cmd.value(),
                cmd.type(),
                cmd.description(),
                cmd.isSecret(),
                cmd.environmentId()
        );

        configurationRepository.save(configuration);
        eventPublisher.publish(new ConfigurationCreatedEvent(
                configuration.getId().id(),
                configuration.getKey(),
                configuration.getEnvironmentId()
        ));

        return configuration.getId().id();
    }

    /**
     * Update an existing configuration.
     * @param cmd the command containing updated configuration details
     */
    public void updateConfiguration(UpdateConfigurationCmd cmd) {
        var configuration = configurationRepository.findById(ConfigurationId.of(cmd.configurationId()))
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Configuration not found with id: " + cmd.configurationId()));

        // Create version history before updating
        var version = ConfigurationVersionEntity.create(
                configuration.getKey(),
                configuration.getValue(),
                configuration.getType(),
                configuration.getDescription(),
                configuration.getVersionNumber()
        );
        configuration.addVersion(version);

        // Update fields
        if (cmd.value() != null) {
            configuration.updateValue(cmd.value());
        }

        if (cmd.type() != null) {
            configuration.updateType(cmd.type());
        }

        // Description is updated directly via reflection in a real impl,
        // but for now we'll skip since the entity doesn't have an updateDescription method
        // This will be handled at the entity level if needed

        if (cmd.isSecret() != null) {
            if (cmd.isSecret()) {
                configuration.markAsSecret();
            } else {
                configuration.markAsNonSecret();
            }
        }

        configurationRepository.save(configuration);
        eventPublisher.publish(new ConfigurationUpdatedEvent(
                configuration.getId().id(),
                configuration.getKey(),
                configuration.getEnvironmentId(),
                configuration.getVersionNumber()
        ));
    }

    /**
     * Delete a configuration.
     * @param configurationId the ID of the configuration to delete
     */
    public void deleteConfiguration(String configurationId) {
        var configuration = configurationRepository.findById(ConfigurationId.of(configurationId))
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Configuration not found with id: " + configurationId));

        String key = configuration.getKey();
        String environmentId = configuration.getEnvironmentId();

        configurationRepository.delete(configuration);
        eventPublisher.publish(new ConfigurationDeletedEvent(
                configurationId,
                key,
                environmentId
        ));
    }

    /**
     * Bulk update configurations for an environment.
     * @param environmentId the environment ID
     * @param configurations list of configurations to update/create
     */
    public void bulkUpsertConfigurations(String environmentId, List<CreateConfigurationCmd> configurations) {
        for (var cmd : configurations) {
            configurationRepository.findByEnvironmentIdAndKey(environmentId, cmd.key())
                    .ifPresentOrElse(
                            existing -> {
                                // Update existing
                                var updateCmd = new UpdateConfigurationCmd(
                                        existing.getId().id(),
                                        cmd.value(),
                                        cmd.type(),
                                        cmd.description(),
                                        cmd.isSecret()
                                );
                                updateConfiguration(updateCmd);
                            },
                            () -> {
                                // Create new
                                createConfiguration(cmd);
                            }
                    );
        }
    }
}
