package com.devkit.environments.domain;

import com.devkit.environments.domain.events.EnvironmentCreatedEvent;
import com.devkit.environments.domain.vo.EnvironmentId;
import com.devkit.shared.domain.ResourceNotFoundException;
import com.devkit.shared.domain.SpringEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Command Service for Environment write operations.
 */
@Service
@Transactional
public class EnvironmentCommandService {

    private final EnvironmentRepository environmentRepository;
    private final SpringEventPublisher eventPublisher;

    EnvironmentCommandService(
            EnvironmentRepository environmentRepository,
            SpringEventPublisher eventPublisher) {
        this.environmentRepository = environmentRepository;
        this.eventPublisher = eventPublisher;
    }

    /**
     * Create a new environment.
     * @param cmd the command containing environment details
     * @return the ID of the created environment
     */
    public String createEnvironment(CreateEnvironmentCmd cmd) {
        // Check if environment with same name already exists
        environmentRepository.findByApplicationIdAndName(cmd.applicationId(), cmd.name())
                .ifPresent(existing -> {
                    throw new IllegalArgumentException(
                            "Environment with name '" + cmd.name() + "' already exists for this application");
                });

        var environment = EnvironmentEntity.create(
                cmd.name(),
                cmd.description(),
                cmd.applicationId(),
                cmd.color()
        );

        // Set inheritance if specified
        if (cmd.inheritFromId() != null) {
            environmentRepository.findById(EnvironmentId.of(cmd.inheritFromId()))
                    .ifPresentOrElse(
                        parent -> environment.setInheritFrom(parent),
                        () -> { throw new ResourceNotFoundException("Parent environment not found"); }
                    );
        }

        environmentRepository.save(environment);
        eventPublisher.publish(new EnvironmentCreatedEvent(
                environment.getId().id(),
                environment.getName(),
                environment.getApplicationId()
        ));

        return environment.getId().id();
    }

    /**
     * Update an existing environment.
     * @param cmd the command containing updated environment details
     */
    public void updateEnvironment(UpdateEnvironmentCmd cmd) {
        var environment = environmentRepository.findById(EnvironmentId.of(cmd.environmentId()))
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Environment not found with id: " + cmd.environmentId()));

        if (cmd.description() != null) {
            environment.updateDescription(cmd.description());
        }

        if (cmd.inheritFromId() != null) {
            var inheritFrom = environmentRepository.findById(EnvironmentId.of(cmd.inheritFromId()))
                    .orElse(null);
            environment.setInheritFrom(inheritFrom);
        }

        environmentRepository.save(environment);
    }

    /**
     * Delete an environment.
     * @param environmentId the ID of the environment to delete
     */
    public void deleteEnvironment(String environmentId) {
        var environment = environmentRepository.findById(EnvironmentId.of(environmentId))
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Environment not found with id: " + environmentId));

        environmentRepository.delete(environment);
    }
}
