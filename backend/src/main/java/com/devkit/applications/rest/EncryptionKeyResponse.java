package com.devkit.applications.rest;

import java.time.Instant;

/**
 * Response DTO for encryption key operations.
 * Note: The actual key is only returned once during creation.
 */
public record EncryptionKeyResponse(
    String applicationId,
    String keyHash,
    Integer keyVersion,
    Boolean isActive,
    Instant lastRotatedAt,
    String rotatedBy,
    Instant createdAt,
    Instant updatedAt,
    // Only populated during creation
    String plaintextKey
) {
    /**
     * Creates a response without the plaintext key (for GET operations).
     */
    public static EncryptionKeyResponse withoutKey(
            String applicationId,
            String keyHash,
            Integer keyVersion,
            Boolean isActive,
            Instant lastRotatedAt,
            String rotatedBy,
            Instant createdAt,
            Instant updatedAt) {
        return new EncryptionKeyResponse(
                applicationId,
                keyHash,
                keyVersion,
                isActive,
                lastRotatedAt,
                rotatedBy,
                createdAt,
                updatedAt,
                null
        );
    }

    /**
     * Creates a response with the plaintext key (only during creation).
     */
    public static EncryptionKeyResponse withKey(
            String applicationId,
            String keyHash,
            Integer keyVersion,
            String plaintextKey,
            Instant createdAt) {
        return new EncryptionKeyResponse(
                applicationId,
                keyHash,
                keyVersion,
                true,
                null,
                null,
                createdAt,
                createdAt,
                plaintextKey
        );
    }

    /**
     * Creates a response after key rotation.
     */
    public static EncryptionKeyResponse afterRotation(
            String applicationId,
            String keyHash,
            Integer keyVersion,
            String rotatedBy,
            Instant lastRotatedAt,
            Instant updatedAt) {
        return new EncryptionKeyResponse(
                applicationId,
                keyHash,
                keyVersion,
                true,
                lastRotatedAt,
                rotatedBy,
                null,
                updatedAt,
                null
        );
    }
}
