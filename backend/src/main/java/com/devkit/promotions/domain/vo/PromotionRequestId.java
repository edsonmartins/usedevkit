package com.devkit.promotions.domain.vo;

import com.devkit.shared.domain.ValueObject;
import jakarta.persistence.Embeddable;

import java.util.UUID;

/**
 * Value Object for Promotion Request ID.
 */
@Embeddable
public class PromotionRequestId extends ValueObject {

    private final String id;

    protected PromotionRequestId() {
        this.id = null;
    }

    private PromotionRequestId(String id) {
        if (id == null || id.isBlank()) {
            throw new IllegalArgumentException("Promotion request ID cannot be null or empty");
        }
        this.id = id;
    }

    public static PromotionRequestId of(String id) {
        return new PromotionRequestId(id);
    }

    public static PromotionRequestId generate() {
        return new PromotionRequestId("promo_" + UUID.randomUUID().toString().substring(0, 8));
    }

    public String id() {
        return id;
    }

    @Override
    public String toString() {
        return id;
    }
}
