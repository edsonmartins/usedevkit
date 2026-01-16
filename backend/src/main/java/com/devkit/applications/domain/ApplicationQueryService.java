package com.devkit.applications.domain;

import com.devkit.shared.domain.ResourceNotFoundException;
import com.devkit.applications.domain.vo.ApplicationId;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Query Service for Application read operations.
 */
@Service
@Transactional(readOnly = true)
public class ApplicationQueryService {

    private final ApplicationRepository applicationRepository;
    private final ApplicationMapper applicationMapper;

    ApplicationQueryService(
            ApplicationRepository applicationRepository,
            ApplicationMapper applicationMapper) {
        this.applicationRepository = applicationRepository;
        this.applicationMapper = applicationMapper;
    }

    /**
     * Get all applications.
     * @return list of all applications
     */
    public List<ApplicationResult> getAllApplications() {
        return applicationRepository.findAll()
                .stream()
                .map(applicationMapper::toApplicationResult)
                .toList();
    }

    /**
     * Get all active applications.
     * @return list of active applications
     */
    public List<ApplicationResult> getActiveApplications() {
        return applicationRepository.findAllActive()
                .stream()
                .map(applicationMapper::toApplicationResult)
                .toList();
    }

    /**
     * Get application by ID.
     * @param applicationId the application ID
     * @return the application
     */
    public ApplicationResult getApplicationById(String applicationId) {
        var application = applicationRepository.findById(ApplicationId.of(applicationId))
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Application not found with id: " + applicationId));
        return applicationMapper.toApplicationResult(application);
    }

    /**
     * Get application by name.
     * @param name the application name
     * @return the application
     */
    public ApplicationResult getApplicationByName(String name) {
        var application = applicationRepository.getByName(name);
        return applicationMapper.toApplicationResult(application);
    }

    /**
     * Get applications by owner email.
     * @param email the owner email
     * @return list of applications
     */
    public List<ApplicationResult> getApplicationsByOwner(String email) {
        return applicationRepository.findByOwnerEmail(email)
                .stream()
                .map(applicationMapper::toApplicationResult)
                .toList();
    }
}
