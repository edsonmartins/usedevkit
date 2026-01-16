package com.devkit.auth.security;

import com.devkit.applications.domain.ApplicationApiKeyEntity;
import com.devkit.applications.domain.ApplicationRepository;
import com.devkit.shared.domain.ResourceNotFoundException;
import com.devkit.shared.security.EncryptionService;
import io.jsonwebtoken.JwtException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Date;

/**
 * Service for API Key authentication and JWT token generation.
 */
@Service
public class ApiKeyAuthService {

    private static final Logger log = LoggerFactory.getLogger(ApiKeyAuthService.class);

    private final ApplicationRepository applicationRepository;
    private final EncryptionService encryptionService;
    private final JwtService jwtService;

    public ApiKeyAuthService(
            ApplicationRepository applicationRepository,
            EncryptionService encryptionService,
            JwtService jwtService) {
        this.applicationRepository = applicationRepository;
        this.encryptionService = encryptionService;
        this.jwtService = jwtService;
    }

    /**
     * Authenticate an application using API key and generate JWT tokens.
     *
     * @param apiKey the raw API key
     * @return AuthenticationResponse containing access and refresh tokens
     * @throws AuthenticationException if authentication fails
     */
    public AuthenticationResponse authenticate(String apiKey) {
        // Extract prefix from API key
        String prefix = extractPrefix(apiKey);

        // Hash the API key to compare with stored hash
        String apiKeyHash = encryptionService.hashApiKey(apiKey);

        // Find the API key entity
        ApplicationApiKeyEntity apiKeyEntity = applicationRepository.findAll().stream()
                .flatMap(app -> app.getApiKeys().stream())
                .filter(key -> key.getKeyHash().equals(apiKeyHash))
                .filter(key -> key.getKeyPrefix().equals(prefix))
                .findFirst()
                .orElseThrow(() -> new AuthenticationException("Invalid API key"));

        // Check if API key is active
        if (!apiKeyEntity.isActive()) {
            throw new AuthenticationException("API key is inactive");
        }

        // Check if API key is expired
        if (apiKeyEntity.isExpired()) {
            throw new AuthenticationException("API key has expired");
        }

        // Check if application is active
        if (!apiKeyEntity.getApplication().isActive()) {
            throw new AuthenticationException("Application is inactive");
        }

        // Update last used timestamp
        apiKeyEntity.updateLastUsed();
        applicationRepository.save(apiKeyEntity.getApplication());

        // Generate JWT tokens
        String applicationId = apiKeyEntity.getApplication().getId().id();
        String accessToken = jwtService.generateAccessToken(applicationId);
        String refreshToken = jwtService.generateRefreshToken(applicationId);

        log.info("Application {} authenticated successfully", applicationId);

        return new AuthenticationResponse(
                accessToken,
                refreshToken,
                jwtService.getRemainingTime(accessToken),
                "Bearer"
        );
    }

    /**
     * Validate a JWT token and return the application ID.
     *
     * @param token the JWT token
     * @return the application ID
     * @throws AuthenticationException if validation fails
     */
    public String validateToken(String token) {
        if (!jwtService.validateToken(token)) {
            throw new AuthenticationException("Invalid token");
        }

        if (jwtService.isTokenExpired(token)) {
            throw new AuthenticationException("Token expired");
        }

        return jwtService.extractApplicationId(token);
    }

    /**
     * Refresh an access token using a refresh token.
     *
     * @param refreshToken the refresh token
     * @return new access token
     * @throws AuthenticationException if refresh fails
     */
    public AuthenticationResponse refreshToken(String refreshToken) {
        try {
            String applicationId = jwtService.extractApplicationId(refreshToken);

            if (!jwtService.validateToken(refreshToken)) {
                throw new AuthenticationException("Invalid refresh token");
            }

            String newAccessToken = jwtService.generateAccessToken(applicationId);

            return new AuthenticationResponse(
                    newAccessToken,
                    refreshToken,
                    jwtService.getRemainingTime(newAccessToken),
                    "Bearer"
            );
        } catch (JwtException e) {
            throw new AuthenticationException("Failed to refresh token", e);
        }
    }

    /**
     * Extract the prefix from an API key.
     *
     * @param apiKey the API key
     * @return the prefix
     */
    private String extractPrefix(String apiKey) {
        // Format: dk_<4 chars>_<rest>
        if (apiKey == null || !apiKey.startsWith("dk_")) {
            throw new AuthenticationException("Invalid API key format");
        }

        int secondUnderscore = apiKey.indexOf('_', 3);
        if (secondUnderscore == -1) {
            throw new AuthenticationException("Invalid API key format");
        }

        return apiKey.substring(0, secondUnderscore + 1);
    }

    /**
     * Generate a new API key for an application.
     *
     * @param applicationId the application ID
     * @param name the name of the API key
     * @return the generated API key
     */
    public String generateApiKey(String applicationId, String name) {
        var application = applicationRepository.findById(
                        com.devkit.applications.domain.vo.ApplicationId.of(applicationId))
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        String apiKey = encryptionService.generateApiKey();
        String apiKeyHash = encryptionService.hashApiKey(apiKey);
        String prefix = extractPrefix(apiKey);

        Instant expiresAt = Instant.now().plusSeconds(30 * 24 * 60 * 60); // 30 days

        var apiKeyEntity = ApplicationApiKeyEntity.create(
                apiKeyHash,
                prefix,
                name,
                expiresAt,
                application
        );

        application.addApiKey(apiKeyEntity);
        applicationRepository.save(application);

        log.info("Generated new API key {} for application {}", name, applicationId);

        return apiKey;
    }
}
