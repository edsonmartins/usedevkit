package com.devkit.services.domain;

import com.devkit.services.domain.vo.ServiceId;
import com.devkit.shared.domain.ResourceNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Service Registry - Manages service catalog, health checks, and dependency graph.
 */
@Service
@Transactional
public class ServiceRegistry {

    private static final Logger logger = LoggerFactory.getLogger(ServiceRegistry.class);

    private final ServiceRepository serviceRepository;

    ServiceRegistry(ServiceRepository serviceRepository) {
        this.serviceRepository = serviceRepository;
    }

    // ==================== Service Management ====================

    /**
     * Register a new service.
     */
    public String registerService(ServiceEntity service) {
        // Check if service already exists
        Optional<ServiceEntity> existing = serviceRepository.findByNameAndServiceVersion(
            service.getName(),
            service.getVersion()
        );

        if (existing.isPresent()) {
            throw new IllegalArgumentException(
                "Service " + service.getName() + " v" + service.getVersion() + " already exists"
            );
        }

        ServiceEntity saved = serviceRepository.save(service);
        logger.info("Registered service: {} v{}", saved.getName(), saved.getVersion());

        return saved.getId().id();
    }

    /**
     * Update service status.
     */
    public void updateServiceStatus(String serviceId, ServiceEntity.ServiceStatus status) {
        ServiceEntity service = getServiceById(serviceId);
        service.updateStatus(status);
        serviceRepository.save(service);
        logger.info("Updated service {} status to {}", service.getName(), status);
    }

    /**
     * Get service by ID.
     */
    public ServiceEntity getService(String serviceId) {
        return getServiceById(serviceId);
    }

    /**
     * Get service by name and version.
     */
    public ServiceEntity getServiceByNameAndVersion(String name, String version) {
        return serviceRepository.findByNameAndServiceVersion(name, version)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Service not found: " + name + " v" + version
            ));
    }

    /**
     * Get all services.
     */
    public List<ServiceEntity> getAllServices() {
        return serviceRepository.findAll();
    }

    /**
     * Get all active services.
     */
    public List<ServiceEntity> getActiveServices() {
        return serviceRepository.findByIsActiveTrue();
    }

    /**
     * Get services by environment.
     */
    public List<ServiceEntity> getServicesByEnvironment(String environment) {
        return serviceRepository.findByEnvironment(environment);
    }

    /**
     * Deactivate a service.
     */
    public void deactivateService(String serviceId) {
        ServiceEntity service = getServiceById(serviceId);
        service.setActive(false);
        serviceRepository.save(service);
        logger.info("Deactivated service: {}", service.getName());
    }

    // ==================== Dependency Management ====================

    /**
     * Add dependency between services.
     */
    public void addDependency(String sourceServiceId, String targetServiceId, String dependencyType) {
        ServiceEntity source = getServiceById(sourceServiceId);
        ServiceEntity target = getServiceById(targetServiceId);

        source.addDependency(target, dependencyType);
        serviceRepository.save(source);

        logger.info("Added dependency: {} -> {} ({})",
            source.getName(), target.getName(), dependencyType);
    }

    /**
     * Remove dependency.
     */
    public void removeDependency(String sourceServiceId, String targetServiceId) {
        ServiceEntity source = getServiceById(sourceServiceId);
        ServiceEntity target = getServiceById(targetServiceId);

        source.removeDependency(target.getId());
        serviceRepository.save(source);

        logger.info("Removed dependency: {} -> {}", source.getName(), target.getName());
    }

    /**
     * Get dependency graph for all services.
     */
    public Map<String, List<DependencyNode>> getDependencyGraph() {
        List<ServiceEntity> services = serviceRepository.findAllWithDependencies();

        Map<String, List<DependencyNode>> graph = new HashMap<>();

        for (ServiceEntity service : services) {
            List<DependencyNode> dependencies = service.getDependencies().stream()
                .map(dep -> new DependencyNode(
                    dep.getTargetService().getName(),
                    dep.getTargetService().getVersion(),
                    dep.getType().name(),
                    dep.getDescription()
                ))
                .collect(Collectors.toList());

            graph.put(service.getName() + ":" + service.getVersion(), dependencies);
        }

        return graph;
    }

    /**
     * Get dependents (services that depend on this service).
     */
    public List<ServiceEntity> getDependents(String serviceId) {
        return serviceRepository.findDependents(serviceId);
    }

    /**
     * Check for circular dependencies.
     */
    public List<CircularDependency> detectCircularDependencies() {
        List<ServiceEntity> services = serviceRepository.findAllWithDependencies();
        List<CircularDependency> circularDeps = new ArrayList<>();

        for (ServiceEntity service : services) {
            Set<String> visited = new HashSet<>();
            Set<String> recursionStack = new HashSet<>();
            List<String> path = new ArrayList<>();

            if (hasCycle(service, visited, recursionStack, path)) {
                circularDeps.add(new CircularDependency(
                    service.getName(),
                    new ArrayList<>(path)
                ));
            }
        }

        return circularDeps;
    }

    private boolean hasCycle(
            ServiceEntity service,
            Set<String> visited,
            Set<String> recursionStack,
            List<String> path) {

        String key = service.getName() + ":" + service.getVersion();

        if (recursionStack.contains(key)) {
            return true;
        }

        if (visited.contains(key)) {
            return false;
        }

        visited.add(key);
        recursionStack.add(key);
        path.add(key);

        for (ServiceDependencyEntity dep : service.getDependencies()) {
            if (hasCycle(dep.getTargetService(), visited, recursionStack, path)) {
                return true;
            }
        }

        recursionStack.remove(key);
        path.remove(path.size() - 1);

        return false;
    }

    // ==================== Health Management ====================

    /**
     * Perform health check on all services.
     */
    public Map<String, ServiceEntity.ServiceStatus> performHealthChecks() {
        Map<String, ServiceEntity.ServiceStatus> healthStatus = new HashMap<>();

        List<ServiceEntity> services = serviceRepository.findByIsActiveTrue();

        for (ServiceEntity service : services) {
            if (service.getHealthCheckUrl() != null) {
                ServiceEntity.ServiceStatus status = checkHealth(service);
                service.updateStatus(status);
                serviceRepository.save(service);
                healthStatus.put(service.getName(), status);
            }
        }

        return healthStatus;
    }

    /**
     * Perform health check on a specific service.
     */
    public ServiceEntity.ServiceStatus checkServiceHealth(String serviceId) {
        ServiceEntity service = getServiceById(serviceId);

        if (service.getHealthCheckUrl() == null) {
            return ServiceEntity.ServiceStatus.UNKNOWN;
        }

        ServiceEntity.ServiceStatus status = checkHealth(service);
        service.updateStatus(status);
        serviceRepository.save(service);

        return status;
    }

    /**
     * Get overall health statistics.
     */
    public HealthStatistics getHealthStatistics() {
        long total = serviceRepository.countByIsActiveTrue();
        long healthy = serviceRepository.countByStatus(ServiceEntity.ServiceStatus.HEALTHY);
        long degraded = serviceRepository.countByStatus(ServiceEntity.ServiceStatus.DEGRADED);
        long down = serviceRepository.countByStatus(ServiceEntity.ServiceStatus.DOWN);
        long unknown = serviceRepository.countByStatus(ServiceEntity.ServiceStatus.UNKNOWN);

        return new HealthStatistics(total, healthy, degraded, down, unknown);
    }

    private ServiceEntity.ServiceStatus checkHealth(ServiceEntity service) {
        try {
            // In a real implementation, this would make an HTTP request
            // to the service's health check endpoint
            // For now, we'll simulate it

            if (service.getHealthCheckUrl() != null) {
                // TODO: Implement actual HTTP health check
                // HttpClient.get(service.getHealthCheckUrl())

                // Simulate: 90% healthy, 10% degraded
                if (Math.random() > 0.1) {
                    return ServiceEntity.ServiceStatus.HEALTHY;
                } else {
                    return ServiceEntity.ServiceStatus.DEGRADED;
                }
            }

            return ServiceEntity.ServiceStatus.UNKNOWN;
        } catch (Exception e) {
            logger.error("Health check failed for service: {}", service.getName(), e);
            return ServiceEntity.ServiceStatus.DOWN;
        }
    }

    // ==================== Search & Query ====================

    /**
     * Search services by name or description.
     */
    public List<ServiceEntity> searchServices(String query) {
        return serviceRepository.findAll().stream()
            .filter(s -> s.getName().toLowerCase().contains(query.toLowerCase()) ||
                       (s.getDescription() != null && s.getDescription().toLowerCase().contains(query.toLowerCase())))
            .collect(Collectors.toList());
    }

    /**
     * Get services by type.
     */
    public List<ServiceEntity> getServicesByType(ServiceEntity.ServiceType type) {
        return serviceRepository.findByType(type);
    }

    /**
     * Get services by team.
     */
    public List<ServiceEntity> getServicesByTeam(String team) {
        return serviceRepository.findByTeam(team);
    }

    // ==================== Helper Methods ====================

    private ServiceEntity getServiceById(String serviceId) {
        return serviceRepository.findById(ServiceId.of(serviceId))
            .orElseThrow(() -> new ResourceNotFoundException(
                "Service not found with id: " + serviceId
            ));
    }

    // ==================== DTOs ====================

    public record DependencyNode(
        String serviceName,
        String version,
        String type,
        String description
    ) {}

    public record CircularDependency(
        String serviceName,
        List<String> cycle
    ) {}

    public record HealthStatistics(
        long total,
        long healthy,
        long degraded,
        long down,
        long unknown
    ) {
        public double getHealthyPercentage() {
            return total > 0 ? (healthy * 100.0 / total) : 0.0;
        }
    }
}
