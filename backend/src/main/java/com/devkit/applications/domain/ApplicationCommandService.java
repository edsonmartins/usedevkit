package com.devkit.applications.domain;

import com.devkit.shared.domain.ResourceNotFoundException;
import com.devkit.shared.domain.SpringEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Command Service for Application write operations.
 */
@Service
@Transactional
public class ApplicationCommandService {

    private final ApplicationRepository applicationRepository;
    private final SpringEventPublisher eventPublisher;

    ApplicationCommandService(
            ApplicationRepository applicationRepository,
            SpringEventPublisher eventPublisher) {
        this.applicationRepository = applicationRepository;
        this.eventPublisher = eventPublisher;
    }

    /**
     * Create a new application.
     * @param cmd the command containing application details
     * @return the ID of the created application
     */
    public String createApplication(CreateApplicationCmd cmd) {
        // Check if application with same name already exists
        applicationRepository.findByName(cmd.name())
                .ifPresent(existing -> {
                    throw new IllegalArgumentException("Application with name '" + cmd.name() + "' already exists");
                });

        var application = ApplicationEntity.create(
                cmd.name(),
                cmd.description(),
                cmd.ownerEmail()
        );

        applicationRepository.save(application);
        eventPublisher.publish(new ApplicationCreatedEvent(
                application.getId().id(),
                application.getName(),
                application.getOwnerEmail()
        ));

        return application.getId().id();
    }

    /**
     * Update an existing application.
     * @param cmd the command containing updated application details
     */
    public void updateApplication(UpdateApplicationCmd cmd) {
        var application = applicationRepository.findById(
                        com.devkit.applications.domain.vo.ApplicationId.of(cmd.applicationId()))
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Application not found with id: " + cmd.applicationId()));

        if (cmd.name() != null && !cmd.name().isBlank()) {
            // Check if another application with the same name exists
            applicationRepository.findByName(cmd.name())
                    .filter(existing -> !existing.getId().id().equals(cmd.applicationId()))
                    .ifPresent(existing -> {
                        throw new IllegalArgumentException("Application with name '" + cmd.name() + "' already exists");
                    });
            application.setName(cmd.name());
        }

        application.updateDescription(cmd.description());

        applicationRepository.save(application);
        eventPublisher.publish(new ApplicationUpdatedEvent(
                application.getId().id(),
                application.getName()
        ));
    }

    /**
     * Deactivate an application.
     * @param applicationId the ID of the application to deactivate
     */
    public void deactivateApplication(String applicationId) {
        var application = applicationRepository.findById(
                        com.devkit.applications.domain.vo.ApplicationId.of(applicationId))
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Application not found with id: " + applicationId));

        application.deactivate();
        applicationRepository.save(application);
        eventPublisher.publish(new ApplicationDeactivatedEvent(
                application.getId().id(),
                application.getName()
        ));
    }

    /**
     * Activate an application.
     * @param applicationId the ID of the application to activate
     */
    public void activateApplication(String applicationId) {
        var application = applicationRepository.findById(
                        com.devkit.applications.domain.vo.ApplicationId.of(applicationId))
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Application not found with id: " + applicationId));

        application.activate();
        applicationRepository.save(application);
        eventPublisher.publish(new ApplicationActivatedEvent(
                application.getId().id(),
                application.getName()
        ));
    }

    /**
     * Delete an application.
     * @param applicationId the ID of the application to delete
     */
    public void deleteApplication(String applicationId) {
        var application = applicationRepository.findById(
                        com.devkit.applications.domain.vo.ApplicationId.of(applicationId))
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Application not found with id: " + applicationId));

        applicationRepository.delete(application);
        eventPublisher.publish(new ApplicationDeletedEvent(
                application.getId().id(),
                application.getName()
        ));
    }
}
