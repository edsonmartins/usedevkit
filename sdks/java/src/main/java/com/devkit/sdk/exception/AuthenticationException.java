package com.devkit.sdk.exception;

/**
 * Exception thrown when authentication fails.
 */
public class AuthenticationException extends DevKitException {

    public AuthenticationException(String message) {
        super(message);
    }

    public AuthenticationException(String message, Throwable cause) {
        super(message, cause);
    }
}
