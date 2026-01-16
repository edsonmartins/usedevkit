package com.devkit.shared.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.GCMParameterSpec;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.security.Key;
import java.util.Base64;

/**
 * Service for AES-256-GCM encryption and decryption.
 * Uses authenticated encryption for data at rest protection.
 */
@Service
public class EncryptionService {

    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final int KEY_SIZE = 256;
    private static final int GCM_IV_LENGTH = 12;
    private static final int GCM_TAG_LENGTH = 128;

    private final Key masterKey;
    private final SecureRandom secureRandom;

    public EncryptionService(@Value("${devkit.security.encryption.master-key}") String masterKeyString) {
        if (masterKeyString == null || masterKeyString.length() < 32) {
            throw new IllegalArgumentException("Master key must be at least 32 characters long");
        }

        // Derive a 256-bit key from the master key string
        this.masterKey = deriveKey(masterKeyString);
        this.secureRandom = new SecureRandom();
    }

    /**
     * Encrypt a plaintext string using AES-256-GCM.
     *
     * @param plaintext the plaintext to encrypt
     * @return Base64-encoded encrypted data (IV + ciphertext + tag)
     */
    public String encrypt(String plaintext) {
        try {
            // Generate random IV
            byte[] iv = new byte[GCM_IV_LENGTH];
            secureRandom.nextBytes(iv);

            // Initialize cipher for encryption
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            GCMParameterSpec parameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.ENCRYPT_MODE, masterKey, parameterSpec);

            // Encrypt the plaintext
            byte[] ciphertext = cipher.doFinal(plaintext.getBytes(StandardCharsets.UTF_8));

            // Combine IV and ciphertext
            byte[] encryptedData = new byte[GCM_IV_LENGTH + ciphertext.length];
            System.arraycopy(iv, 0, encryptedData, 0, GCM_IV_LENGTH);
            System.arraycopy(ciphertext, 0, encryptedData, GCM_IV_LENGTH, ciphertext.length);

            // Return Base64-encoded
            return Base64.getEncoder().encodeToString(encryptedData);
        } catch (Exception e) {
            throw new EncryptionException("Failed to encrypt data", e);
        }
    }

    /**
     * Decrypt a Base64-encoded encrypted string.
     *
     * @param encryptedData Base64-encoded encrypted data (IV + ciphertext + tag)
     * @return the decrypted plaintext
     */
    public String decrypt(String encryptedData) {
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
            cipher.init(Cipher.DECRYPT_MODE, masterKey, parameterSpec);

            // Decrypt the ciphertext
            byte[] plaintext = cipher.doFinal(ciphertext);

            return new String(plaintext, StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new EncryptionException("Failed to decrypt data", e);
        }
    }

    /**
     * Derive a 256-bit AES key from a string using SHA-256.
     *
     * @param keyString the key string
     * @return the derived key
     */
    private Key deriveKey(String keyString) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] keyBytes = digest.digest(keyString.getBytes(StandardCharsets.UTF_8));
            return new SecretKeySpec(keyBytes, "AES");
        } catch (Exception e) {
            throw new EncryptionException("Failed to derive encryption key", e);
        }
    }

    /**
     * Generate a new random encryption key.
     *
     * @return Base64-encoded key
     */
    public static String generateKey() {
        try {
            KeyGenerator keyGenerator = KeyGenerator.getInstance("AES");
            keyGenerator.init(KEY_SIZE);
            SecretKey key = keyGenerator.generateKey();
            return Base64.getEncoder().encodeToString(key.getEncoded());
        } catch (Exception e) {
            throw new EncryptionException("Failed to generate encryption key", e);
        }
    }

    /**
     * Hash an API key using SHA-256.
     *
     * @param apiKey the API key to hash
     * @return the hashed key
     */
    public String hashApiKey(String apiKey) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(apiKey.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (Exception e) {
            throw new EncryptionException("Failed to hash API key", e);
        }
    }

    /**
     * Generate a random API key prefix.
     *
     * @return the prefix (e.g., "dk_test_")
     */
    public String generateApiKeyPrefix() {
        return "dk_" + generateRandomString(4) + "_";
    }

    /**
     * Generate a full API key.
     *
     * @return the API key
     */
    public String generateApiKey() {
        String prefix = generateApiKeyPrefix();
        String randomPart = generateRandomString(32);
        return prefix + randomPart;
    }

    /**
     * Generate a random string.
     *
     * @param length the length of the string
     * @return the random string
     */
    private String generateRandomString(int length) {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        StringBuilder result = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            result.append(chars.charAt(secureRandom.nextInt(chars.length())));
        }
        return result.toString();
    }
}
