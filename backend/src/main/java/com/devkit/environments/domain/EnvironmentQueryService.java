package com.devkit.environments.domain;

import com.devkit.shared.domain.ResourceNotFoundException;
import com.devkit.environments.domain.vo.EnvironmentId;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Query Service for Environment read operations.
 */
@Service
@Transactional(readOnly = true)
public class EnvironmentQueryService {

    private final EnvironmentRepository environmentRepository;

    EnvironmentQueryService(EnvironmentRepository environmentRepository) {
        this.environmentRepository = environmentRepository;
    }

    /**
     * Get all environments for an application.
     * @param applicationId the application ID
     * @return list of environment results
     */
    public List<EnvironmentResult> getEnvironmentsByApplication(String applicationId) {
        return environmentRepository.findByApplicationId(applicationId)
                .stream()
                .map(EnvironmentResult::from)
                .collect(Collectors.toList());
    }

    /**
     * Get environment by ID.
     * @param environmentId the environment ID
     * @return the environment result
     */
    public EnvironmentResult getEnvironmentById(String environmentId) {
        return environmentRepository.findById(EnvironmentId.of(environmentId))
                .map(EnvironmentResult::from)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Environment not found with id: " + environmentId));
    }

    /**
     * Get environment by application and name.
     * @param applicationId the application ID
     * @param name the environment name
     * @return the environment result
     */
    public EnvironmentResult getEnvironmentByApplicationAndName(String applicationId, String name) {
        return EnvironmentResult.from(
                environmentRepository.getByApplicationIdAndName(applicationId, name)
        );
    }
}
