package com.devkit.services.domain;

import com.devkit.services.domain.vo.ServiceId;
import com.devkit.shared.domain.AssertUtil;
import com.devkit.shared.domain.BaseEntity;
import jakarta.persistence.*;

import java.net.URI;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * Represents a Service in the microservices architecture.
 * Tracks service metadata, health, and dependencies.
 */
@Entity
@Table(name = "services", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"name", "version"})
})
public class ServiceEntity extends BaseEntity {

    public enum ServiceStatus {
        HEALTHY, DEGRADED, DOWN, UNKNOWN
    }

    public enum ServiceType {
        API, WORKER, WEB, MOBILE, DATABASE, CACHE, QUEUE, OTHER
    }

    @EmbeddedId
    @AttributeOverride(name = "id", column = @Column(name = "id", nullable = false))
    private ServiceId id;

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "version", nullable = false, length = 50)
    private String version;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "repository_url", length = 500)
    private String repositoryUrl;

    @Column(name = "documentation_url", length = 500)
    private String documentationUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", length = 50, nullable = false)
    private ServiceType type;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20, nullable = false)
    private ServiceStatus status;

    @Column(name = "owner", length = 255)
    private String owner;

    @Column(name = "team", length = 255)
    private String team;

    @Column(name = "language", length = 100)
    private String language;

    @Column(name = "health_check_url", length = 500)
    private String healthCheckUrl;

    @Column(name = "environment", length = 100)
    private String environment;

    @Column(name = "port", nullable = false)
    private Integer port;

    @Column(name = "base_path", length = 255)
    private String basePath;

    @Column(name = "tags", columnDefinition = "TEXT")
    private String tags; // JSON array stored as text

    @Column(name = "last_health_check")
    private Instant lastHealthCheck;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive;

    @Version
    private int version;

    // Associations
    @OneToMany(mappedBy = "sourceService", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ServiceDependencyEntity> dependencies = new ArrayList<>();

    // Protected no-arg constructor for JPA
    protected ServiceEntity() {}

    // Public constructor
    public ServiceEntity(
            ServiceId id,
            String name,
            String version,
            String description,
            String repositoryUrl,
            String documentationUrl,
            ServiceType type,
            String owner,
            String team,
            String language,
            String environment,
            Integer port) {

        this.id = AssertUtil.requireNotNull(id, "Service id cannot be null");
        this.name = AssertUtil.requireNotBlank(name, "Service name cannot be null or empty");
        this.version = AssertUtil.requireNotBlank(version, "Service version cannot be null or empty");
        this.description = description;
        this.repositoryUrl = repositoryUrl;
        this.documentationUrl = documentationUrl;
        this.type = AssertUtil.requireNotNull(type, "Service type cannot be null");
        this.status = ServiceStatus.UNKNOWN;
        this.owner = owner;
        this.team = team;
        this.language = language;
        this.environment = environment;
        this.port = AssertUtil.requireNotNull(port, "Service port cannot be null");
        this.isActive = true;
    }

    // Factory method
    public static ServiceEntity create(
            String name,
            String version,
            String description,
            String repositoryUrl,
            String documentationUrl,
            ServiceType type,
            String owner,
            String team,
            String language,
            String environment,
            Integer port) {

        return new ServiceEntity(
                ServiceId.generate(),
                name,
                version,
                description,
                repositoryUrl,
                documentationUrl,
                type,
                owner,
                team,
                language,
                environment,
                port
        );
    }

    // Domain methods
    public void updateStatus(ServiceStatus newStatus) {
        this.status = AssertUtil.requireNotNull(newStatus, "Status cannot be null");
        this.lastHealthCheck = Instant.now();
    }

    public void updateHealthCheck(String healthCheckUrl) {
        this.healthCheckUrl = healthCheckUrl;
    }

    public void addDependency(ServiceEntity targetService, String dependencyType) {
        ServiceDependencyEntity dependency = ServiceDependencyEntity.create(
                this,
                targetService,
                dependencyType
        );

        if (!dependencies.contains(dependency)) {
            dependencies.add(dependency);
        }
    }

    public void removeDependency(ServiceId targetServiceId) {
        dependencies.removeIf(dep -> dep.getTargetService().getId().equals(targetServiceId));
    }

    public boolean isHealthy() {
        return status == ServiceStatus.HEALTHY;
    }

    public boolean isDown() {
        return status == ServiceStatus.DOWN;
    }

    // Getters
    public ServiceId getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getVersion() {
        return version;
    }

    public String getDescription() {
        return description;
    }

    public String getRepositoryUrl() {
        return repositoryUrl;
    }

    public String getDocumentationUrl() {
        return documentationUrl;
    }

    public ServiceType getType() {
        return type;
    }

    public ServiceStatus getStatus() {
        return status;
    }

    public String getOwner() {
        return owner;
    }

    public String getTeam() {
        return team;
    }

    public String getLanguage() {
        return language;
    }

    public String getHealthCheckUrl() {
        return healthCheckUrl;
    }

    public String getEnvironment() {
        return environment;
    }

    public Integer getPort() {
        return port;
    }

    public String getBasePath() {
        return basePath;
    }

    public String getTags() {
        return tags;
    }

    public Instant getLastHealthCheck() {
        return lastHealthCheck;
    }

    public Boolean isActive() {
        return isActive;
    }

    public List<ServiceDependencyEntity> getDependencies() {
        return dependencies;
    }

    // Setters
    public void setTags(String tags) {
        this.tags = tags;
    }

    public void setBasePath(String basePath) {
        this.basePath = basePath;
    }

    public void setActive(boolean active) {
        this.isActive = active;
    }
}
