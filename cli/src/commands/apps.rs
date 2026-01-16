use crate::cli::AppsCommands;
use crate::client::ApiClient;
use serde::Deserialize;
use serde::Serialize;

#[derive(Debug, Deserialize)]
struct ApplicationResponse {
    id: String,
    name: String,
    description: Option<String>,
    #[serde(rename = "ownerEmail")]
    owner_email: String,
    #[serde(rename = "isActive")]
    is_active: bool,
}

#[derive(Serialize)]
struct CreateApplicationRequest {
    name: String,
    description: Option<String>,
    #[serde(rename = "ownerEmail")]
    owner_email: String,
}

#[derive(Serialize)]
struct UpdateApplicationRequest {
    name: Option<String>,
    description: Option<String>,
}

pub async fn handle(command: AppsCommands, client: ApiClient) -> anyhow::Result<()> {
    match command {
        AppsCommands::List => {
            let apps: Vec<ApplicationResponse> = client.get("/api/v1/applications").await?;
            for app in apps {
                let description = app.description.unwrap_or_else(|| "".to_string());
                println!("{}\t{}\t{}", app.id, app.name, description);
            }
        }
        AppsCommands::Create {
            name,
            description,
            owner_email,
        } => {
            let request = CreateApplicationRequest {
                name,
                description,
                owner_email,
            };

            let _: serde_json::Value = client.post("/api/v1/applications", &request).await?;
            println!("Application created");
        }
        AppsCommands::Show { id } => {
            let app: ApplicationResponse = client
                .get(&format!("/api/v1/applications/{}", id))
                .await?;

            println!("{}\t{}\t{}\t{}", app.id, app.name, app.owner_email, app.is_active);
        }
        AppsCommands::Update {
            id,
            name,
            description,
        } => {
            let request = UpdateApplicationRequest { name, description };
            let _: serde_json::Value = client
                .put(&format!("/api/v1/applications/{}", id), &request)
                .await?;
            println!("Application updated");
        }
    }

    Ok(())
}
