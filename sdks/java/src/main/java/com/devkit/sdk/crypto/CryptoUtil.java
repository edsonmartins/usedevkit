package com.devkit.sdk.crypto;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * Utility class for client-side encryption and decryption.
 * Uses AES-256-GCM for authenticated encryption.
 * <p>
 * The SDK decrypts configurations and secrets locally using the application's
 * encryption key, which should be configured via environment variable or
 * programmatically.
 */
public class CryptoUtil {

    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final int KEY_SIZE = 256;
    private static final int GCM_IV_LENGTH = 12;
    private static final int GCM_TAG_LENGTH = 128;
    private static final int PBKDF2_ITERATIONS = 100000;

    private final SecretKey applicationKey;
    private final SecureRandom secureRandom;

    /**
     * Creates a CryptoUtil with the provided application encryption key.
     *
     * @param applicationKey Base64-encoded application encryption key
     * @throws IllegalArgumentException if the key is invalid
     */
    public CryptoUtil(String applicationKey) {
        if (applicationKey == null || applicationKey.isBlank()) {
            throw new IllegalArgumentException("Application encryption key cannot be null or empty");
        }

        try {
            // Decode the Base64 key
            byte[] keyBytes = Base64.getDecoder().decode(applicationKey);

            // Validate key size (256 bits = 32 bytes)
            if (keyBytes.length != 32) {
                throw new IllegalArgumentException(
                        "Application key must be a 256-bit (32 byte) key. Got: " + keyBytes.length + " bytes");
            }

            this.applicationKey = new SecretKeySpec(keyBytes, "AES");
            this.secureRandom = new SecureRandom();
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid application encryption key", e);
        }
    }

    /**
     * Decrypts data that was encrypted using the application's encryption key.
     * The encrypted data format is: IV (12 bytes) + ciphertext + tag (16 bytes)
     *
     * @param encryptedData Base64-encoded encrypted data
     * @return the decrypted plaintext
     * @throws DecryptionException if decryption fails
     */
    public String decrypt(String encryptedData) {
        if (encryptedData == null || encryptedData.isBlank()) {
            throw new IllegalArgumentException("Encrypted data cannot be null or empty");
        }

        try {
            // Decode Base64
            byte[] decodedData = Base64.getDecoder().decode(encryptedData);

            // Extract IV and ciphertext
            ByteBuffer byteBuffer = ByteBuffer.wrap(decodedData);
            byte[] iv = new byte[GCM_IV_LENGTH];
            byteBuffer.get(iv);
            byte[] ciphertext = new byte[byteBuffer.remaining()];
            byteBuffer.get(ciphertext);

            // Initialize cipher for decryption
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            GCMParameterSpec parameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.DECRYPT_MODE, applicationKey, parameterSpec);

            // Decrypt the ciphertext
            byte[] plaintext = cipher.doFinal(ciphertext);

            return new String(plaintext, StandardCharsets.UTF_8);
        } catch (javax.crypto.AEADBadTagException e) {
            throw new DecryptionException(
                "Decryption failed: authentication tag mismatch. This typically means " +
                "the wrong encryption key was used. Verify DEVKIT_ENCRYPTION_KEY matches " +
                "the application's encryption key.", e);
        } catch (IllegalArgumentException | java.security.NoSuchAlgorithmException |
                 javax.crypto.NoSuchPaddingException e) {
            throw new DecryptionException("Invalid encrypted data format", e);
        } catch (Exception e) {
            throw new DecryptionException("Failed to decrypt data", e);
        }
    }

    /**
     * Encrypts data using the application's encryption key.
     * This is provided for completeness, though typically the server
     * handles encryption when storing data.
     *
     * @param plaintext the plaintext to encrypt
     * @return Base64-encoded encrypted data (IV + ciphertext + tag)
     * @throws RuntimeException if encryption fails
     */
    public String encrypt(String plaintext) {
        if (plaintext == null) {
            throw new IllegalArgumentException("Plaintext cannot be null");
        }

        try {
            // Generate random IV
            byte[] iv = new byte[GCM_IV_LENGTH];
            secureRandom.nextBytes(iv);

            // Initialize cipher for encryption
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            GCMParameterSpec parameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.ENCRYPT_MODE, applicationKey, parameterSpec);

            // Encrypt the plaintext
            byte[] ciphertext = cipher.doFinal(plaintext.getBytes(StandardCharsets.UTF_8));

            // Combine IV and ciphertext
            byte[] encryptedData = new byte[GCM_IV_LENGTH + ciphertext.length];
            System.arraycopy(iv, 0, encryptedData, 0, GCM_IV_LENGTH);
            System.arraycopy(ciphertext, 0, encryptedData, GCM_IV_LENGTH, ciphertext.length);

            // Return Base64-encoded
            return Base64.getEncoder().encodeToString(encryptedData);
        } catch (Exception e) {
            throw new RuntimeException("Failed to encrypt data", e);
        }
    }

    /**
     * Checks if the provided data appears to be encrypted (Base64 encoded).
     * This is a simple heuristic to determine if decryption is needed.
     *
     * @param data the data to check
     * @return true if the data appears to be encrypted
     */
    public static boolean isEncrypted(String data) {
        if (data == null || data.isEmpty()) {
            return false;
        }

        try {
            // Base64 encoded strings with IV + ciphertext + tag should be longer than this
            // (12 bytes IV + at least 1 byte + 16 bytes tag = 29 bytes minimum)
            if (data.length() < 29) {
                return false;
            }

            // Try to decode as Base64
            byte[] decoded = Base64.getDecoder().decode(data);

            // Should have at least IV + some data + tag
            return decoded.length >= GCM_IV_LENGTH + 16;
        } catch (IllegalArgumentException e) {
            // Not valid Base64
            return false;
        }
    }

    /**
     * Gets the SHA-256 hash of the application key.
     * This can be used to verify the key matches what's configured on the server.
     *
     * @return Base64-encoded hash of the application key
     */
    public String getKeyHash() {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(applicationKey.getEncoded());
            return Base64.getEncoder().encodeToString(hash);
        } catch (Exception e) {
            throw new RuntimeException("Failed to compute key hash", e);
        }
    }

    /**
     * Generates a new random encryption key.
     * This should be called by the server when creating a new application.
     *
     * @return Base64-encoded 256-bit key
     */
    public static String generateKey() {
        try {
            SecureRandom secureRandom = new SecureRandom();
            byte[] keyBytes = new byte[32]; // 256 bits
            secureRandom.nextBytes(keyBytes);
            return Base64.getEncoder().encodeToString(keyBytes);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate encryption key", e);
        }
    }
}
