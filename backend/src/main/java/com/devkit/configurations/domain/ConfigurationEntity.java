package com.devkit.configurations.domain;

import com.devkit.configurations.domain.vo.ConfigurationId;
import com.devkit.shared.domain.AssertUtil;
import com.devkit.shared.domain.BaseEntity;
import jakarta.persistence.*;

import java.util.HashSet;
import java.util.Set;

/**
 * Represents a Configuration key-value pair.
 * Configurations can be versioned and support type validation.
 */
@Entity
@Table(name = "configurations", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"environment_id", "key"})
})
public class ConfigurationEntity extends BaseEntity {

    public enum ConfigType {
        STRING, INTEGER, BOOLEAN, JSON, DOUBLE, SECRET
    }

    @EmbeddedId
    @AttributeOverride(name = "id", column = @Column(name = "id", nullable = false))
    private ConfigurationId id;

    @Column(name = "key", nullable = false, length = 255)
    private String key;

    @Column(name = "value", columnDefinition = "TEXT")
    private String value;

    @Column(name = "encrypted_value", columnDefinition = "TEXT")
    private String encryptedValue;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 20)
    private ConfigType type;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "is_secret", nullable = false)
    private Boolean isSecret;

    @Column(name = "environment_id", nullable = false, length = 255)
    private String environmentId;

    @Column(name = "tenant_id")
    private Long tenantId;

    @Column(name = "config_version", nullable = false)
    private Integer versionNumber;

    @OneToMany(mappedBy = "configuration", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ConfigurationVersionEntity> versionHistory = new HashSet<>();

    @Version
    private int version;

    // Protected no-arg constructor for JPA
    protected ConfigurationEntity() {}

    // Public constructor
    public ConfigurationEntity(
            ConfigurationId id,
            String key,
            String value,
            ConfigType type,
            String description,
            Boolean isSecret,
            String environmentId) {

        this.id = AssertUtil.requireNotNull(id, "Configuration id cannot be null");
        this.key = AssertUtil.requireNotBlank(key, "Configuration key cannot be null or empty");
        this.value = AssertUtil.requireNotNull(value, "Configuration value cannot be null");
        this.type = AssertUtil.requireNotNull(type, "Configuration type cannot be null");
        this.description = description;
        this.isSecret = isSecret != null ? isSecret : false;
        this.environmentId = AssertUtil.requireNotBlank(environmentId, "Environment id cannot be null or empty");
        this.versionNumber = 1;
    }

    // Factory method
    public static ConfigurationEntity create(
            String key,
            String value,
            ConfigType type,
            String description,
            Boolean isSecret,
            String environmentId) {

        return new ConfigurationEntity(
                ConfigurationId.generate(),
                key,
                value,
                type,
                description,
                isSecret,
                environmentId
        );
    }

    // Domain methods
    public void updateValue(String value) {
        this.value = AssertUtil.requireNotNull(value, "Configuration value cannot be null");
        this.versionNumber++;
    }

    public void updateEncryptedValue(String encryptedValue) {
        this.encryptedValue = AssertUtil.requireNotNull(encryptedValue, "Encrypted value cannot be null");
        this.value = null; // Clear plaintext value for secrets
        this.versionNumber++;
    }

    /**
     * Sets encrypted value directly without incrementing versionNumber.
     * Package-private for internal use by ConfigurationCommandService.
     * WARNING: Use only for initial value setting during entity creation.
     * For normal updates, use updateEncryptedValue() instead.
     */
    void setEncryptedValueDirectly(String encryptedValue) {
        this.encryptedValue = encryptedValue;
    }

    /**
     * Sets value directly without incrementing versionNumber.
     * Package-private for internal use by ConfigurationCommandService.
     * WARNING: Use only for initial value setting or clearing during entity creation.
     * For normal updates, use updateValue() instead.
     */
    void setValueDirectly(String value) {
        this.value = value;
    }

    public void updateType(ConfigType type) {
        this.type = AssertUtil.requireNotNull(type, "Configuration type cannot be null");
    }

    public void markAsSecret() {
        this.isSecret = true;
    }

    public void markAsNonSecret() {
        this.isSecret = false;
    }

    public void addVersion(ConfigurationVersionEntity versionEntity) {
        this.versionHistory.add(versionEntity);
    }

    // Getters
    public ConfigurationId getId() {
        return id;
    }

    public String getKey() {
        return key;
    }

    public String getValue() {
        return value;
    }

    public ConfigType getType() {
        return type;
    }

    public String getDescription() {
        return description;
    }

    public Boolean isSecret() {
        return isSecret;
    }

    public String getEnvironmentId() {
        return environmentId;
    }

    public Long getTenantId() {
        return tenantId;
    }

    // Package-private setter for tenant filtering
    void setTenantId(Long tenantId) {
        this.tenantId = tenantId;
    }

    public Integer getVersionNumber() {
        return versionNumber;
    }

    public Set<ConfigurationVersionEntity> getVersionHistory() {
        return Set.copyOf(versionHistory);
    }

    public int getVersion() {
        return version;
    }

    public String getEncryptedValue() {
        return encryptedValue;
    }
}
