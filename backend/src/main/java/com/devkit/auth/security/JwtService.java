package com.devkit.auth.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;

/**
 * Service for JWT token generation and validation.
 */
@Service
public class JwtService {

    private final Key signingKey;
    private final long accessTokenExpiration;
    private final long refreshTokenExpiration;

    public JwtService(
            @Value("${devkit.security.jwt.secret}") String jwtSecret,
            @Value("${devkit.security.jwt.access-token-expiration:900000}") long accessTokenExpiration,
            @Value("${devkit.security.jwt.refresh-token-expiration:604800000}") long refreshTokenExpiration) {

        if (jwtSecret == null || jwtSecret.length() < 512) {
            throw new IllegalArgumentException("JWT secret must be at least 512 bits (64 bytes) for HS512");
        }

        this.signingKey = Keys.hmacShaKeyFor(jwtSecret.getBytes());
        this.accessTokenExpiration = accessTokenExpiration;
        this.refreshTokenExpiration = refreshTokenExpiration;
    }

    /**
     * Generate an access token for an application.
     *
     * @param applicationId the application ID
     * @return the JWT token
     */
    public String generateAccessToken(String applicationId) {
        return generateToken(applicationId, accessTokenExpiration);
    }

    /**
     * Generate a refresh token for an application.
     *
     * @param applicationId the application ID
     * @return the JWT token
     */
    public String generateRefreshToken(String applicationId) {
        return generateToken(applicationId, refreshTokenExpiration);
    }

    /**
     * Generate a JWT token with the specified expiration.
     *
     * @param applicationId the application ID
     * @param expiration the expiration time in milliseconds
     * @return the JWT token
     */
    private String generateToken(String applicationId, long expiration) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);

        return Jwts.builder()
                .subject(applicationId)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(signingKey, SignatureAlgorithm.HS512)
                .compact();
    }

    /**
     * Extract the application ID from a JWT token.
     *
     * @param token the JWT token
     * @return the application ID
     */
    public String extractApplicationId(String token) {
        Claims claims = extractClaims(token);
        return claims.getSubject();
    }

    /**
     * Validate a JWT token.
     *
     * @param token the JWT token
     * @return true if valid, false otherwise
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith((javax.crypto.SecretKey) signingKey)
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    /**
     * Extract all claims from a JWT token.
     *
     * @param token the JWT token
     * @return the claims
     */
    public Claims extractClaims(String token) {
        return Jwts.parser()
                .verifyWith((javax.crypto.SecretKey) signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * Check if a token is expired.
     *
     * @param token the JWT token
     * @return true if expired, false otherwise
     */
    public boolean isTokenExpired(String token) {
        try {
            Claims claims = extractClaims(token);
            return claims.getExpiration().before(new Date());
        } catch (Exception e) {
            return true;
        }
    }

    /**
     * Get the remaining time until token expiration.
     *
     * @param token the JWT token
     * @return the remaining time in milliseconds, or 0 if expired
     */
    public long getRemainingTime(String token) {
        try {
            Claims claims = extractClaims(token);
            Date expiration = claims.getExpiration();
            return expiration.getTime() - System.currentTimeMillis();
        } catch (Exception e) {
            return 0;
        }
    }
}
