package com.devkit.services.domain;

import com.devkit.shared.domain.AssertUtil;
import com.devkit.shared.domain.BaseEntity;
import jakarta.persistence.*;

import java.time.Instant;

/**
 * Represents a dependency relationship between two services.
 * Used to build the service dependency graph.
 */
@Entity
@Table(name = "service_dependencies",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"source_service_id", "target_service_id"})
    }
)
public class ServiceDependencyEntity extends BaseEntity {

    public enum DependencyType {
        HTTP, GRPC, MESSAGE_QUEUE, DATABASE, CACHE, SYNC
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "source_service_id", nullable = false, length = 255)
    private String sourceServiceId;

    @Column(name = "target_service_id", nullable = false, length = 255)
    private String targetServiceId;

    @Enumerated(EnumType.STRING)
    @Column(name = "dependency_type", length = 50, nullable = false)
    private DependencyType type;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "is_required", nullable = false)
    private Boolean required;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    // Many-to-One relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_service_id", insertable = false, updatable = false)
    private ServiceEntity sourceService;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_service_id", insertable = false, updatable = false)
    private ServiceEntity targetService;

    // Protected no-arg constructor for JPA
    protected ServiceDependencyEntity() {}

    // Public constructor
    public ServiceDependencyEntity(
            ServiceEntity sourceService,
            ServiceEntity targetService,
            DependencyType type,
            String description,
            Boolean required) {

        this.sourceService = AssertUtil.requireNotNull(sourceService, "Source service cannot be null");
        this.targetService = AssertUtil.requireNotNull(targetService, "Target service cannot be null");
        this.sourceServiceId = sourceService.getId().id();
        this.targetServiceId = targetService.getId().id();
        this.type = AssertUtil.requireNotNull(type, "Dependency type cannot be null");
        this.description = description;
        this.required = required != null ? required : true;
        this.createdAt = Instant.now();
    }

    // Factory method
    public static ServiceDependencyEntity create(
            ServiceEntity sourceService,
            ServiceEntity targetService,
            String type) {

        return new ServiceDependencyEntity(
                sourceService,
                targetService,
                DependencyType.valueOf(type.toUpperCase()),
                null,
                true
        );
    }

    // Getters
    public Long getId() {
        return id;
    }

    public ServiceEntity getSourceService() {
        return sourceService;
    }

    public ServiceEntity getTargetService() {
        return targetService;
    }

    public String getSourceServiceId() {
        return sourceServiceId;
    }

    public String getTargetServiceId() {
        return targetServiceId;
    }

    public DependencyType getType() {
        return type;
    }

    public String getDescription() {
        return description;
    }

    public Boolean isRequired() {
        return required;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    // Setters
    public void setDescription(String description) {
        this.description = description;
    }

    public void setRequired(Boolean required) {
        this.required = required;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ServiceDependencyEntity)) return false;

        ServiceDependencyEntity that = (ServiceDependencyEntity) o;

        return sourceServiceId.equals(that.sourceServiceId) &&
               targetServiceId.equals(that.targetServiceId);
    }

    @Override
    public int hashCode() {
        int result = sourceServiceId.hashCode();
        result = 31 * result + targetServiceId.hashCode();
        return result;
    }
}
