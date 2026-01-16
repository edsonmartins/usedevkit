use crate::cli::{Cli, Commands};
use crate::client::ApiClient;
use crate::config::{CliConfig, Profile};

mod apps;
mod config;
mod secrets;

pub async fn run(cli: Cli) -> anyhow::Result<()> {
    let profile_name = cli.profile.clone();

    match cli.command {
        Commands::Login { url, api_key } => {
            let mut config = CliConfig::load()?;
            config.upsert_profile(Profile {
                name: profile_name.clone(),
                base_url: url,
                api_key,
            });
            config.save()?;
            println!("Saved profile '{}'", profile_name);
        }
        Commands::Config { command } => {
            let profile = load_profile(&profile_name)?;
            let client = ApiClient::new(profile.base_url, profile.api_key);
            config::handle(command, client).await?;
        }
        Commands::Apps { command } => {
            let profile = load_profile(&profile_name)?;
            let client = ApiClient::new(profile.base_url, profile.api_key);
            apps::handle(command, client).await?;
        }
        Commands::Secrets { command } => {
            let profile = load_profile(&profile_name)?;
            let client = ApiClient::new(profile.base_url, profile.api_key);
            secrets::handle(command, client).await?;
        }
    }

    Ok(())
}

fn load_profile(name: &str) -> anyhow::Result<Profile> {
    let config = CliConfig::load()?;
    config
        .get_profile(name)
        .cloned()
        .ok_or_else(|| anyhow::anyhow!("Profile '{}' not found. Run devkit login.", name))
}
