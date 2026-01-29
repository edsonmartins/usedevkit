package com.devkit.secrets.integrations;

import com.devkit.secrets.domain.SecretEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.secretsmanager.SecretsManagerClient;
import software.amazon.awssdk.services.secretsmanager.model.CreateSecretRequest;
import software.amazon.awssdk.services.secretsmanager.model.DeleteSecretRequest;
import software.amazon.awssdk.services.secretsmanager.model.DescribeSecretRequest;
import software.amazon.awssdk.services.secretsmanager.model.PutSecretValueRequest;
import software.amazon.awssdk.services.secretsmanager.model.ResourceNotFoundException;

import java.net.URI;

/**
 * AWS Secrets Manager integration.
 */
@Service
@Primary
@ConditionalOnProperty(prefix = "devkit.secrets.aws", name = "enabled", havingValue = "true")
public class AwsSecretsManagerService implements SecretExternalManager {

    private static final Logger logger = LoggerFactory.getLogger(AwsSecretsManagerService.class);

    private final SecretsManagerClient client;

    public AwsSecretsManagerService(
            @Value("${devkit.secrets.aws.region:us-east-1}") String region,
            @Value("${devkit.secrets.aws.endpoint:}") String endpoint) {
        SecretsManagerClient.Builder builder = SecretsManagerClient.builder()
            .region(Region.of(region));
        if (endpoint != null && !endpoint.isBlank()) {
            builder = builder.endpointOverride(URI.create(endpoint));
        }
        this.client = builder.build();
    }

    @Override
    public void upsertSecret(SecretEntity secret, String plaintextValue, String description) {
        if (secret.getExternalProvider() != SecretEntity.ExternalProvider.AWS_SECRETS_MANAGER) {
            return;
        }
        String secretName = secret.getExternalSecretName();
        if (secretName == null || secretName.isBlank()) {
            return;
        }

        try {
            client.describeSecret(DescribeSecretRequest.builder().secretId(secretName).build());
            client.putSecretValue(PutSecretValueRequest.builder()
                .secretId(secretName)
                .secretString(plaintextValue)
                .build());
            logger.info("Updated AWS secret: {}", secretName);
        } catch (ResourceNotFoundException notFound) {
            client.createSecret(CreateSecretRequest.builder()
                .name(secretName)
                .description(description)
                .secretString(plaintextValue)
                .build());
            logger.info("Created AWS secret: {}", secretName);
        }
    }

    @Override
    public void deleteSecret(SecretEntity secret) {
        if (secret.getExternalProvider() != SecretEntity.ExternalProvider.AWS_SECRETS_MANAGER) {
            return;
        }
        String secretName = secret.getExternalSecretName();
        if (secretName == null || secretName.isBlank()) {
            return;
        }
        client.deleteSecret(DeleteSecretRequest.builder()
            .secretId(secretName)
            .forceDeleteWithoutRecovery(true)
            .build());
        logger.info("Deleted AWS secret: {}", secretName);
    }
}
