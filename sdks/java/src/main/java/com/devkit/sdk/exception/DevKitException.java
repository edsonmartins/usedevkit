package com.devkit.sdk.exception;

/**
 * Base exception for all DevKit SDK exceptions.
 */
public class DevKitException extends RuntimeException {

    public DevKitException(String message) {
        super(message);
    }

    public DevKitException(String message, Throwable cause) {
        super(message, cause);
    }
}
