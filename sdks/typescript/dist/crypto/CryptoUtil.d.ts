/**
 * Crypto utility for client-side encryption and decryption.
 * Uses AES-256-GCM for authenticated encryption.
 * <p>
 * The SDK decrypts configurations and secrets locally using the application's
 * encryption key, which should be configured via environment variable or
 * programmatically.
 */
/**
 * Exception thrown when decryption fails.
 * This indicates the data could not be decrypted, possibly due to:
 * - Wrong encryption key used
 * - Corrupted encrypted data
 * - Invalid data format
 */
export declare class DecryptionException extends Error {
    constructor(message: string, cause?: unknown);
    cause?: Error;
}
/**
 * Result of a decryption operation.
 */
export interface DecryptResult {
    plaintext: string;
    wasEncrypted: boolean;
}
/**
 * Utility class for encryption and decryption operations.
 */
export declare class CryptoUtil {
    private readonly keyPromise;
    /**
     * Creates a CryptoUtil with the provided application encryption key.
     *
     * @param encryptionKey Base64-encoded application encryption key (32 bytes for AES-256)
     * @throws Error if the key is invalid
     */
    constructor(encryptionKey: string);
    /**
     * Decrypts data that was encrypted using the application's encryption key.
     * The encrypted data format is: IV (12 bytes) + ciphertext + tag (16 bytes)
     *
     * @param encryptedData Base64-encoded encrypted data
     * @returns the decrypted plaintext
     * @throws DecryptionException if decryption fails
     */
    decrypt(encryptedData: string): Promise<string>;
    /**
     * Encrypts data using the application's encryption key.
     * This is provided for completeness, though typically the server
     * handles encryption when storing data.
     *
     * @param plaintext the plaintext to encrypt
     * @returns Base64-encoded encrypted data (IV + ciphertext + tag)
     * @throws Error if encryption fails
     */
    encrypt(plaintext: string): Promise<string>;
    /**
     * Checks if the provided data appears to be encrypted (Base64 encoded).
     * This is a simple heuristic to determine if decryption is needed.
     *
     * @param data the data to check
     * @returns true if the data appears to be encrypted
     */
    static isEncrypted(data: string): boolean;
    /**
     * Gets the SHA-256 hash of the application key.
     * This can be used to verify the key matches what's configured on the server.
     *
     * @returns Base64-encoded SHA-256 hash of the application key
     */
    getKeyHash(): Promise<string>;
    /**
     * Generates a new random encryption key.
     * This should be called by the server when creating a new application.
     *
     * @returns Base64-encoded 256-bit key
     */
    static generateKey(): Promise<string>;
}
/**
 * Retrieves the encryption key from environment or options.
 * Priority: options > process.env.DEVKIT_ENCRYPTION_KEY
 *
 * @param optionsKey optional key from options
 * @returns the encryption key or undefined
 */
export declare function getEncryptionKey(optionsKey?: string): string | undefined;
//# sourceMappingURL=CryptoUtil.d.ts.map