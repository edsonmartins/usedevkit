package com.devkit.bootstrap.domain;

/**
 * Exception thrown when bootstrap operation fails.
 */
public class BootstrapException extends RuntimeException {

    public BootstrapException(String message) {
        super(message);
    }

    public BootstrapException(String message, Throwable cause) {
        super(message, cause);
    }
}
