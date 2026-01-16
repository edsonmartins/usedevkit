package com.devkit.shared.security;

import com.devkit.shared.domain.DomainException;

/**
 * Exception thrown when encryption/decryption operations fail.
 */
public class EncryptionException extends DomainException {

    public EncryptionException(String message) {
        super(message);
    }

    public EncryptionException(String message, Throwable cause) {
        super(message, cause);
    }
}
