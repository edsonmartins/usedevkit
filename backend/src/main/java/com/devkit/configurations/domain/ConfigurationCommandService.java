package com.devkit.configurations.domain;

import com.devkit.applications.domain.ApplicationEncryptionKeyRepository;
import com.devkit.configurations.domain.events.ConfigurationCreatedEvent;
import com.devkit.configurations.domain.events.ConfigurationDeletedEvent;
import com.devkit.configurations.domain.events.ConfigurationUpdatedEvent;
import com.devkit.configurations.domain.vo.ConfigurationId;
import com.devkit.environments.domain.EnvironmentEntity;
import com.devkit.environments.domain.EnvironmentRepository;
import com.devkit.shared.domain.ResourceNotFoundException;
import com.devkit.shared.domain.SpringEventPublisher;
import com.devkit.shared.security.EncryptionService;
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
    private final EnvironmentRepository environmentRepository;
    private final ApplicationEncryptionKeyRepository encryptionKeyRepository;
    private final EncryptionService encryptionService;

    ConfigurationCommandService(
            ConfigurationRepository configurationRepository,
            SpringEventPublisher eventPublisher,
            EnvironmentRepository environmentRepository,
            ApplicationEncryptionKeyRepository encryptionKeyRepository,
            EncryptionService encryptionService) {
        this.configurationRepository = configurationRepository;
        this.eventPublisher = eventPublisher;
        this.environmentRepository = environmentRepository;
        this.encryptionKeyRepository = encryptionKeyRepository;
        this.encryptionService = encryptionService;
    }

    public String createConfiguration(CreateConfigurationCmd cmd) {
        configurationRepository.findByEnvironmentIdAndKey(cmd.environmentId(), cmd.key())
                .ifPresent(existing -> {
                    throw new IllegalArgumentException(
                            "Configuration with key '" + cmd.key() + "' already exists in environment");
                });

        EnvironmentEntity environment = environmentRepository.findById(
                        com.devkit.environments.domain.vo.EnvironmentId.of(cmd.environmentId()))
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Environment not found: " + cmd.environmentId()));

        String applicationId = environment.getApplicationId();

        var configuration = ConfigurationEntity.create(
                cmd.key(),
                cmd.value(),
                cmd.type(),
                cmd.description(),
                cmd.isSecret(),
                cmd.environmentId()
        );

        if (Boolean.TRUE.equals(cmd.isSecret())) {
            encryptConfigurationValue(configuration, applicationId, cmd.value());
        }

        configurationRepository.save(configuration);
        eventPublisher.publish(new ConfigurationCreatedEvent(
                configuration.getId().id(),
                configuration.getKey(),
                configuration.getEnvironmentId()
        ));

        return configuration.getId().id();
    }

    private void encryptConfigurationValue(ConfigurationEntity configuration, String applicationId, String plaintextValue) {
        var encryptionKey = encryptionKeyRepository.findLatestActiveByApplicationId(applicationId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Application encryption key not found. Please create an encryption key for this application first."));

        String applicationKey = encryptionService.unwrapApplicationKey(encryptionKey.getEncryptedKey());
        String encryptedValue = encryptionService.encryptForApp(
                plaintextValue,
                applicationKey,
                encryptionKey.getSalt()
        );

        configuration.setEncryptedValueDirectly(encryptedValue);
        configuration.setValueDirectly(null);
    }

    public void updateConfiguration(UpdateConfigurationCmd cmd) {
        var configuration = configurationRepository.findById(ConfigurationId.of(cmd.configurationId()))
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Configuration not found with id: " + cmd.configurationId()));

        EnvironmentEntity environment = environmentRepository.findById(
                        com.devkit.environments.domain.vo.EnvironmentId.of(configuration.getEnvironmentId()))
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Environment not found: " + configuration.getEnvironmentId()));

        String applicationId = environment.getApplicationId();
        String currentValue = configuration.getEncryptedValue() != null
                ? configuration.getEncryptedValue()
                : configuration.getValue();

        var version = ConfigurationVersionEntity.create(
                configuration.getVersionNumber(),
                currentValue,
                "UPDATE",
                "SYSTEM",
                configuration
        );
        configuration.addVersion(version);

        if (cmd.value() != null) {
            if (Boolean.TRUE.equals(cmd.isSecret())) {
                encryptConfigurationValue(configuration, applicationId, cmd.value());
            } else {
                configuration.updateValue(cmd.value());
            }
        }

        if (cmd.type() != null) {
            configuration.updateType(cmd.type());
        }

        if (cmd.isSecret() != null) {
            if (cmd.isSecret()) {
                configuration.markAsSecret();
                if (configuration.getValue() != null && configuration.getEncryptedValue() == null) {
                    encryptConfigurationValue(configuration, applicationId, configuration.getValue());
                }
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

    public void bulkUpsertConfigurations(String environmentId, List<CreateConfigurationCmd> configurations) {
        for (var cmd : configurations) {
            configurationRepository.findByEnvironmentIdAndKey(environmentId, cmd.key())
                    .ifPresentOrElse(
                            existing -> updateConfiguration(new UpdateConfigurationCmd(
                                    existing.getId().id(),
                                    cmd.value(),
                                    cmd.type(),
                                    cmd.description(),
                                    cmd.isSecret()
                            )),
                            () -> createConfiguration(cmd)
                    );
        }
    }
}
