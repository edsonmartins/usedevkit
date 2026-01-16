use crate::cli::ConfigCommands;
use crate::client::ApiClient;
use serde::Deserialize;
use serde::Serialize;

#[derive(Debug, Deserialize)]
#[allow(dead_code)]
struct ConfigurationResponse {
    id: String,
    key: String,
    value: String,
    #[serde(rename = "type")]
    config_type: String,
    description: Option<String>,
    #[serde(rename = "isSecret")]
    is_secret: bool,
    #[serde(rename = "environmentId")]
    environment_id: String,
}

#[derive(Serialize)]
struct CreateConfigurationRequest {
    key: String,
    value: String,
    #[serde(rename = "type")]
    config_type: String,
    description: Option<String>,
    #[serde(rename = "isSecret")]
    is_secret: bool,
    #[serde(rename = "environmentId")]
    environment_id: String,
}

#[derive(Serialize)]
struct UpdateConfigurationRequest {
    value: String,
    #[serde(rename = "type")]
    config_type: String,
    description: Option<String>,
    #[serde(rename = "isSecret")]
    is_secret: bool,
}

pub async fn handle(command: ConfigCommands, client: ApiClient) -> anyhow::Result<()> {
    match command {
        ConfigCommands::List { environment } => {
            let configs: Vec<ConfigurationResponse> = client
                .get(&format!("/api/v1/configurations/environment/{}", environment))
                .await?;

            for config in configs {
                println!("{}\t{}\t{}", config.id, config.key, config.value);
            }
        }
        ConfigCommands::Get { environment, key } => {
            let config: ConfigurationResponse = client
                .get(&format!(
                    "/api/v1/configurations/environment/{}/key/{}",
                    environment, key
                ))
                .await?;

            println!("{}", config.value);
        }
        ConfigCommands::Set {
            environment,
            key,
            value,
            config_type,
            secret,
        } => {
            let request = CreateConfigurationRequest {
                key,
                value,
                config_type,
                description: None,
                is_secret: secret,
                environment_id: environment,
            };

            let _: serde_json::Value = client.post("/api/v1/configurations", &request).await?;
            println!("Configuration saved");
        }
        ConfigCommands::Update {
            id,
            value,
            config_type,
            description,
            secret,
        } => {
            let request = UpdateConfigurationRequest {
                value,
                config_type,
                description,
                is_secret: secret,
            };

            let _: serde_json::Value = client
                .put(&format!("/api/v1/configurations/{}", id), &request)
                .await?;
            println!("Configuration updated");
        }
        ConfigCommands::Delete { id } => {
            client
                .delete(&format!("/api/v1/configurations/{}", id))
                .await?;
            println!("Configuration deleted");
        }
    }

    Ok(())
}
