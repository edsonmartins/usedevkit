package com.devkit.sdk.crypto;

/**
 * Exception thrown when decryption fails.
 * This indicates the data could not be decrypted, possibly due to:
 * <ul>
 *   <li>Wrong encryption key used</li>
 *   <li>Corrupted encrypted data</li>
 *   <li>Invalid data format</li>
 * </ul>
 */
public class DecryptionException extends RuntimeException {

    public DecryptionException(String message) {
        super(message);
    }

    public DecryptionException(String message, Throwable cause) {
        super(message, cause);
    }
}
