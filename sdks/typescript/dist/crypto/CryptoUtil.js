"use strict";
/**
 * Crypto utility for client-side encryption and decryption.
 * Uses AES-256-GCM for authenticated encryption.
 * <p>
 * The SDK decrypts configurations and secrets locally using the application's
 * encryption key, which should be configured via environment variable or
 * programmatically.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CryptoUtil = exports.DecryptionException = void 0;
exports.getEncryptionKey = getEncryptionKey;
const ALGORITHM = 'AES-GCM';
const KEY_SIZE = 256; // bits
const IV_LENGTH = 12; // bytes for GCM
const SALT_LENGTH = 16; // bytes for PBKDF2
/**
 * Exception thrown when decryption fails.
 * This indicates the data could not be decrypted, possibly due to:
 * - Wrong encryption key used
 * - Corrupted encrypted data
 * - Invalid data format
 */
class DecryptionException extends Error {
    constructor(message, cause) {
        super(message);
        this.name = 'DecryptionException';
        if (cause instanceof Error) {
            this.cause = cause;
        }
    }
}
exports.DecryptionException = DecryptionException;
/**
 * Utility class for encryption and decryption operations.
 */
class CryptoUtil {
    /**
     * Creates a CryptoUtil with the provided application encryption key.
     *
     * @param encryptionKey Base64-encoded application encryption key (32 bytes for AES-256)
     * @throws Error if the key is invalid
     */
    constructor(encryptionKey) {
        if (!encryptionKey || encryptionKey.trim().length === 0) {
            throw new Error('Application encryption key cannot be null or empty');
        }
        // Decode the Base64 key
        const keyBytes = Uint8Array.from(atob(encryptionKey), c => c.charCodeAt(0));
        // Validate key size (256 bits = 32 bytes)
        if (keyBytes.length !== 32) {
            throw new Error(`Application key must be a 256-bit (32 byte) key. Got: ${keyBytes.length} bytes`);
        }
        // Convert Uint8Array to ArrayBuffer for Web Crypto API
        const keyBuffer = keyBytes.buffer.slice(keyBytes.byteOffset, keyBytes.byteOffset + keyBytes.byteLength);
        // Import the key
        this.keyPromise = crypto.subtle.importKey('raw', keyBuffer, { name: ALGORITHM }, false, ['encrypt', 'decrypt']);
    }
    /**
     * Decrypts data that was encrypted using the application's encryption key.
     * The encrypted data format is: IV (12 bytes) + ciphertext + tag (16 bytes)
     *
     * @param encryptedData Base64-encoded encrypted data
     * @returns the decrypted plaintext
     * @throws DecryptionException if decryption fails
     */
    async decrypt(encryptedData) {
        if (!encryptedData || encryptedData.trim().length === 0) {
            throw new Error('Encrypted data cannot be null or empty');
        }
        try {
            // Decode Base64
            const decodedData = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
            // Extract IV and ciphertext
            const iv = decodedData.slice(0, IV_LENGTH);
            const ciphertext = decodedData.slice(IV_LENGTH);
            // Get the key
            const key = await this.keyPromise;
            // Decrypt
            const plaintextBuffer = await crypto.subtle.decrypt({ name: ALGORITHM, iv }, key, ciphertext);
            // Decode to string
            const decoder = new TextDecoder();
            return decoder.decode(plaintextBuffer);
        }
        catch (error) {
            // OperationError from Web Crypto API typically means wrong key or corrupted data
            if (error instanceof DOMException && error.name === 'OperationError') {
                throw new DecryptionException('Decryption failed: authentication tag mismatch. This typically means ' +
                    'the wrong encryption key was used. Verify DEVKIT_ENCRYPTION_KEY matches ' +
                    'the application\'s encryption key.', error);
            }
            throw new DecryptionException('Failed to decrypt data', error);
        }
    }
    /**
     * Encrypts data using the application's encryption key.
     * This is provided for completeness, though typically the server
     * handles encryption when storing data.
     *
     * @param plaintext the plaintext to encrypt
     * @returns Base64-encoded encrypted data (IV + ciphertext + tag)
     * @throws Error if encryption fails
     */
    async encrypt(plaintext) {
        if (!plaintext) {
            throw new Error('Plaintext cannot be null');
        }
        // Generate random IV
        const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
        // Get the key
        const key = await this.keyPromise;
        // Encode plaintext to bytes
        const encoder = new TextEncoder();
        const plaintextBytes = encoder.encode(plaintext);
        // Encrypt
        const ciphertext = await crypto.subtle.encrypt({ name: ALGORITHM, iv }, key, plaintextBytes);
        // Combine IV and ciphertext
        const combined = new Uint8Array(iv.length + ciphertext.byteLength);
        combined.set(iv);
        combined.set(new Uint8Array(ciphertext), iv.length);
        // Return Base64-encoded
        return btoa(String.fromCharCode(...combined));
    }
    /**
     * Checks if the provided data appears to be encrypted (Base64 encoded).
     * This is a simple heuristic to determine if decryption is needed.
     *
     * @param data the data to check
     * @returns true if the data appears to be encrypted
     */
    static isEncrypted(data) {
        if (!data || data.length === 0) {
            return false;
        }
        // Base64 encoded strings with IV + ciphertext + tag should be longer than this
        // (12 bytes IV + at least 1 byte + 16 bytes tag = 29 bytes minimum after Base64 encoding)
        if (data.length < 29) {
            return false;
        }
        try {
            // Try to decode as Base64
            const decoded = atob(data);
            // Should have at least IV + some data + tag
            return decoded.length >= IV_LENGTH + 16;
        }
        catch {
            // Not valid Base64
            return false;
        }
    }
    /**
     * Gets the SHA-256 hash of the application key.
     * This can be used to verify the key matches what's configured on the server.
     *
     * @returns Base64-encoded SHA-256 hash of the application key
     */
    async getKeyHash() {
        // Export the raw key material
        const key = await this.keyPromise;
        const exported = await crypto.subtle.exportKey('raw', key);
        const hashBuffer = await crypto.subtle.digest('SHA-256', exported);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return btoa(String.fromCharCode(...hashArray));
    }
    /**
     * Generates a new random encryption key.
     * This should be called by the server when creating a new application.
     *
     * @returns Base64-encoded 256-bit key
     */
    static async generateKey() {
        const key = await crypto.subtle.generateKey({ name: ALGORITHM, length: KEY_SIZE }, true, ['encrypt', 'decrypt']);
        const exported = await crypto.subtle.exportKey('raw', key);
        const keyArray = Array.from(new Uint8Array(exported));
        return btoa(String.fromCharCode(...keyArray));
    }
}
exports.CryptoUtil = CryptoUtil;
/**
 * Retrieves the encryption key from environment or options.
 * Priority: options > process.env.DEVKIT_ENCRYPTION_KEY
 *
 * @param optionsKey optional key from options
 * @returns the encryption key or undefined
 */
function getEncryptionKey(optionsKey) {
    if (optionsKey && optionsKey.trim().length > 0) {
        return optionsKey;
    }
    if (typeof process !== 'undefined' && process.env && process.env.DEVKIT_ENCRYPTION_KEY) {
        return process.env.DEVKIT_ENCRYPTION_KEY;
    }
    return undefined;
}
//# sourceMappingURL=CryptoUtil.js.map