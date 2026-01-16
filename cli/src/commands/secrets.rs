use crate::cli::SecretsCommands;
use crate::client::ApiClient;
use serde::Deserialize;
use serde::Serialize;

#[derive(Debug, Deserialize)]
#[allow(dead_code)]
struct SecretResponse {
    id: String,
    key: String,
    description: Option<String>,
    #[serde(rename = "applicationId")]
    application_id: String,
    #[serde(rename = "environmentId")]
    environment_id: Option<String>,
    #[serde(rename = "rotationPolicy")]
    rotation_policy: String,
    #[serde(rename = "isActive")]
    is_active: bool,
}

#[derive(Debug, Deserialize)]
#[allow(dead_code)]
struct SecretWithDecryptedResponse {
    id: String,
    key: String,
    #[serde(rename = "decryptedValue")]
    decrypted_value: String,
    #[serde(rename = "applicationId")]
    application_id: String,
    #[serde(rename = "environmentId")]
    environment_id: Option<String>,
}

#[derive(Debug, Deserialize)]
#[allow(dead_code)]
struct SecretRotationResponse {
    id: String,
    #[serde(rename = "secretId")]
    secret_id: String,
    #[serde(rename = "secretKey")]
    secret_key: String,
    #[serde(rename = "applicationId")]
    application_id: String,
    #[serde(rename = "environmentId")]
    environment_id: Option<String>,
    #[serde(rename = "previousVersion")]
    previous_version: Option<i32>,
    #[serde(rename = "newVersion")]
    new_version: Option<i32>,
    #[serde(rename = "rotatedBy")]
    rotated_by: String,
    status: String,
    reason: String,
    #[serde(rename = "errorMessage")]
    error_message: Option<String>,
    #[serde(rename = "rotationDate")]
    rotation_date: String,
}

#[derive(Debug, Deserialize)]
struct RotationStatsResponse {
    #[serde(rename = "totalRotations")]
    total_rotations: i64,
    #[serde(rename = "successfulRotations")]
    successful_rotations: i64,
    #[serde(rename = "failedRotations")]
    failed_rotations: i64,
    #[serde(rename = "manualRotations")]
    manual_rotations: i64,
    #[serde(rename = "automaticRotations")]
    automatic_rotations: i64,
    #[serde(rename = "successRate")]
    success_rate: f64,
}

#[derive(Debug, Deserialize)]
struct ValidationResponse {
    #[serde(rename = "needsRotation")]
    needs_rotation: Vec<serde_json::Value>,
    #[serde(rename = "expiringSoon")]
    expiring_soon: Vec<serde_json::Value>,
    details: serde_json::Value,
}

#[derive(Serialize)]
struct CreateSecretRequest {
    key: String,
    #[serde(rename = "encryptedValue")]
    encrypted_value: String,
    description: Option<String>,
    #[serde(rename = "applicationId")]
    application_id: String,
    #[serde(rename = "environmentId")]
    environment_id: Option<String>,
    #[serde(rename = "rotationPolicy")]
    rotation_policy: String,
}

#[derive(Serialize)]
struct RotateSecretRequest {
    #[serde(rename = "newEncryptedValue")]
    new_encrypted_value: String,
    #[serde(rename = "rotatedBy")]
    rotated_by: String,
}

pub async fn handle(command: SecretsCommands, client: ApiClient) -> anyhow::Result<()> {
    match command {
        SecretsCommands::List {
            application,
            environment,
        } => {
            let path = if let Some(env) = environment {
                format!(
                    "/api/v1/secrets/application/{}/environment/{}",
                    application, env
                )
            } else {
                format!("/api/v1/secrets/application/{}", application)
            };

            let secrets: Vec<SecretResponse> = client.get(&path).await?;
            for secret in secrets {
                let description = secret.description.unwrap_or_else(|| "".to_string());
                println!("{}\t{}\t{}", secret.id, secret.key, description);
            }
        }
        SecretsCommands::Get { id } => {
            let secret: SecretWithDecryptedResponse = client
                .get(&format!("/api/v1/secrets/{}/decrypt", id))
                .await?;
            println!("{}", secret.decrypted_value);
        }
        SecretsCommands::Create {
            key,
            encrypted_value,
            description,
            application,
            environment,
            rotation_policy,
        } => {
            let request = CreateSecretRequest {
                key,
                encrypted_value,
                description,
                application_id: application,
                environment_id: environment,
                rotation_policy,
            };

            let _: serde_json::Value = client.post("/api/v1/secrets", &request).await?;
            println!("Secret created");
        }
        SecretsCommands::Rotate {
            id,
            new_encrypted_value,
            rotated_by,
        } => {
            let request = RotateSecretRequest {
                new_encrypted_value,
                rotated_by,
            };

            let _: serde_json::Value = client
                .post(&format!("/api/v1/secrets/{}/rotate", id), &request)
                .await?;
            println!("Secret rotated");
        }
        SecretsCommands::Deactivate { id } => {
            let _: serde_json::Value = client
                .post(&format!("/api/v1/secrets/{}/deactivate", id), &serde_json::json!({}))
                .await?;
            println!("Secret deactivated");
        }
        SecretsCommands::Delete { id } => {
            client
                .delete(&format!("/api/v1/secrets/{}", id))
                .await?;
            println!("Secret deleted");
        }
        SecretsCommands::Rotations { secret_id } => {
            let rotations: Vec<SecretRotationResponse> = client
                .get(&format!("/api/v1/secrets/{}/rotations", secret_id))
                .await?;
            for rotation in rotations {
                println!(
                    "{}\t{}\t{}\t{}",
                    rotation.id, rotation.secret_key, rotation.status, rotation.rotation_date
                );
            }
        }
        SecretsCommands::AppRotations { application } => {
            let rotations: Vec<SecretRotationResponse> = client
                .get(&format!(
                    "/api/v1/secrets/application/{}/rotations",
                    application
                ))
                .await?;
            for rotation in rotations {
                println!(
                    "{}\t{}\t{}\t{}",
                    rotation.id, rotation.secret_key, rotation.status, rotation.rotation_date
                );
            }
        }
        SecretsCommands::Validate { application } => {
            let path = if let Some(app) = application {
                format!("/api/v1/secrets/validate?applicationId={}", app)
            } else {
                "/api/v1/secrets/validate".to_string()
            };
            let response: ValidationResponse = client.get(&path).await?;
            println!("needsRotation: {}", response.needs_rotation.len());
            println!("expiringSoon: {}", response.expiring_soon.len());
            println!("details: {}", response.details);
        }
        SecretsCommands::Stats { application } => {
            let path = if let Some(app) = application {
                format!("/api/v1/secrets/stats?applicationId={}", app)
            } else {
                "/api/v1/secrets/stats".to_string()
            };
            let stats: RotationStatsResponse = client.get(&path).await?;
            println!(
                "total={} success={} failed={} manual={} auto={} rate={:.2}",
                stats.total_rotations,
                stats.successful_rotations,
                stats.failed_rotations,
                stats.manual_rotations,
                stats.automatic_rotations,
                stats.success_rate
            );
        }
        SecretsCommands::Recent { days } => {
            let rotations: Vec<SecretRotationResponse> = client
                .get(&format!("/api/v1/secrets/rotations/recent?days={}", days))
                .await?;
            for rotation in rotations {
                println!(
                    "{}\t{}\t{}\t{}",
                    rotation.id, rotation.secret_key, rotation.status, rotation.rotation_date
                );
            }
        }
        SecretsCommands::RotateDue { application } => {
            let path = if let Some(app) = application {
                format!("/api/v1/secrets/rotate-due?applicationId={}", app)
            } else {
                "/api/v1/secrets/rotate-due".to_string()
            };
            let response: serde_json::Value = client.post(&path, &serde_json::json!({})).await?;
            println!("{}", response);
        }
    }

    Ok(())
}
