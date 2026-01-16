package com.devkit.auth.security;

import com.devkit.shared.domain.DomainException;

/**
 * Exception thrown when authentication fails.
 */
public class AuthenticationException extends DomainException {

    public AuthenticationException(String message) {
        super(message);
    }

    public AuthenticationException(String message, Throwable cause) {
        super(message, cause);
    }
}
