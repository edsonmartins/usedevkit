package com.devkit.auth.security;

/**
 * Response object for authentication operations.
 */
public record AuthenticationResponse(
    String accessToken,
    String refreshToken,
    long expiresIn,
    String tokenType
) {
}
