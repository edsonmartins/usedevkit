package com.devkit.services.domain.vo;

import com.devkit.shared.domain.ValueObject;
import jakarta.persistence.Embeddable;

import java.util.UUID;

/**
 * Value Object for Service ID.
 */
@Embeddable
public class ServiceId extends ValueObject {

    private final String id;

    protected ServiceId() {
        this.id = null;
    }

    private ServiceId(String id) {
        if (id == null || id.isBlank()) {
            throw new IllegalArgumentException("Service ID cannot be null or empty");
        }
        this.id = id;
    }

    public static ServiceId of(String id) {
        return new ServiceId(id);
    }

    public static ServiceId generate() {
        return new ServiceId("svc_" + UUID.randomUUID().toString().substring(0, 8));
    }

    public String id() {
        return id;
    }

    @Override
    public String toString() {
        return id;
    }
}
