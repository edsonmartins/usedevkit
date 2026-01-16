# ConfigHub - CLI Tool

## 🎯 Overview

CLI poderoso para gerenciar configurações do ConfigHub direto do terminal. Desenvolvido em **Rust** para máxima performance e portabilidade.

---

## 📦 Estrutura do Projeto

```
cli/
├── src/
│   ├── main.rs
│   ├── cli.rs
│   ├── commands/
│   │   ├── mod.rs
│   │   ├── login.rs
│   │   ├── apps.rs
│   │   ├── configs.rs
│   │   ├── pull.rs
│   │   ├── push.rs
│   │   └── export.rs
│   ├── client/
│   │   ├── mod.rs
│   │   └── api.rs
│   ├── config/
│   │   ├── mod.rs
│   │   └── profile.rs
│   └── utils/
│       ├── mod.rs
│       ├── output.rs
│       └── crypto.rs
├── tests/
│   └── integration_test.rs
├── Cargo.toml
└── README.md
```

---

## 📦 Cargo.toml

```toml
[package]
name = "confighub"
version = "1.0.0"
edition = "2021"
authors = ["ConfigHub Team"]
description = "CLI tool for ConfigHub configuration management"
license = "MIT"
repository = "https://github.com/confighub/confighub"

[[bin]]
name = "confighub"
path = "src/main.rs"

[dependencies]
# CLI framework
clap = { version = "4.4", features = ["derive", "cargo"] }
clap_complete = "4.4"

# Async runtime
tokio = { version = "1.35", features = ["full"] }

# HTTP client
reqwest = { version = "0.11", features = ["json", "rustls-tls"], default-features = false }

# Serialization
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
toml = "0.8"

# Terminal UI
colored = "2.1"
indicatif = "0.17"
dialoguer = "0.11"

# Error handling
anyhow = "1.0"
thiserror = "1.0"

# Config file
directories = "5.0"

# Crypto
ring = "0.17"
base64 = "0.21"

# Table output
comfy-table = "7.1"

# Logging
tracing = "0.1"
tracing-subscriber = "0.3"

[dev-dependencies]
assert_cmd = "2.0"
predicates = "3.0"
tempfile = "3.8"

[profile.release]
opt-level = 3
lto = true
codegen-units = 1
strip = true
```

---

## 🎯 CLI Structure (cli.rs)

```rust
use clap::{Parser, Subcommand};

#[derive(Parser)]
#[command(
    name = "confighub",
    about = "ConfigHub CLI - Manage your configurations",
    version,
    long_about = None
)]
pub struct Cli {
    #[command(subcommand)]
    pub command: Commands,

    /// Config profile to use
    #[arg(short, long, global = true)]
    pub profile: Option<String>,

    /// Enable verbose output
    #[arg(short, long, global = true)]
    pub verbose: bool,
}

#[derive(Subcommand)]
pub enum Commands {
    /// Login to ConfigHub
    Login {
        /// ConfigHub server URL
        #[arg(short, long)]
        url: String,

        /// API key
        #[arg(short, long)]
        api_key: String,

        /// Profile name
        #[arg(short, long, default_value = "default")]
        profile: String,
    },

    /// List applications
    Apps {
        #[command(subcommand)]
        command: Option<AppsCommands>,
    },

    /// Manage configurations
    Config {
        #[command(subcommand)]
        command: ConfigCommands,
    },

    /// Pull configurations from server
    Pull {
        /// Application name
        app: String,

        /// Environment (dev, staging, production)
        #[arg(short, long, default_value = "dev")]
        env: String,

        /// Output format (env, json, yaml)
        #[arg(short, long, default_value = "env")]
        format: String,

        /// Output file (stdout if not specified)
        #[arg(short, long)]
        output: Option<String>,
    },

    /// Push local configurations to server
    Push {
        /// Application name
        app: String,

        /// Environment
        #[arg(short, long)]
        env: String,

        /// Input file (.env, .json, .yaml)
        file: String,
    },

    /// Export configurations
    Export {
        /// Application name
        app: String,

        /// Environment
        #[arg(short, long, default_value = "production")]
        env: String,

        /// Include sensitive values
        #[arg(long)]
        include_sensitive: bool,
    },

    /// Show audit logs
    Audit {
        /// Application name
        #[arg(short, long)]
        app: Option<String>,

        /// Number of days to look back
        #[arg(short, long, default_value = "7")]
        days: u32,
    },

    /// Generate shell completions
    Completions {
        /// Shell type (bash, zsh, fish, powershell)
        shell: String,
    },
}

#[derive(Subcommand)]
pub enum AppsCommands {
    /// List all applications
    List,

    /// Create new application
    Create {
        /// Application name
        name: String,

        /// Description
        #[arg(short, long)]
        description: Option<String>,

        /// Environments (comma-separated)
        #[arg(short, long, default_value = "dev,staging,production")]
        envs: String,
    },

    /// Show application details
    Show {
        /// Application name or ID
        app: String,
    },
}

#[derive(Subcommand)]
pub enum ConfigCommands {
    /// List configurations
    List {
        /// Application name
        app: String,

        /// Environment
        #[arg(short, long)]
        env: String,
    },

    /// Get a configuration value
    Get {
        /// Application name
        app: String,

        /// Environment
        #[arg(short, long)]
        env: String,

        /// Configuration key
        key: String,
    },

    /// Set a configuration value
    Set {
        /// Application name
        app: String,

        /// Environment
        #[arg(short, long)]
        env: String,

        /// Configuration key
        key: String,

        /// Configuration value
        value: String,

        /// Mark as sensitive
        #[arg(long)]
        sensitive: bool,
    },

    /// Delete a configuration
    Delete {
        /// Application name
        app: String,

        /// Environment
        #[arg(short, long)]
        env: String,

        /// Configuration key
        key: String,
    },
}
```

---

## 🔐 API Client (client/api.rs)

```rust
use anyhow::{Context, Result};
use reqwest::{Client, header};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

pub struct ConfigHubClient {
    client: Client,
    base_url: String,
    api_key: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Application {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub active: bool,
    pub environments: Vec<Environment>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Environment {
    pub id: String,
    pub name: String,
}

impl ConfigHubClient {
    pub fn new(base_url: String, api_key: String) -> Result<Self> {
        let mut headers = header::HeaderMap::new();
        headers.insert(
            "X-API-Key",
            header::HeaderValue::from_str(&api_key)?,
        );

        let client = Client::builder()
            .default_headers(headers)
            .timeout(std::time::Duration::from_secs(30))
            .build()?;

        Ok(Self {
            client,
            base_url: base_url.trim_end_matches('/').to_string(),
            api_key,
        })
    }

    pub async fn get_applications(&self) -> Result<Vec<Application>> {
        let url = format!("{}/api/v1/applications", self.base_url);

        let response = self.client
            .get(&url)
            .send()
            .await
            .context("Failed to fetch applications")?;

        if !response.status().is_success() {
            anyhow::bail!("API error: {}", response.status());
        }

        response
            .json()
            .await
            .context("Failed to parse response")
    }

    pub async fn get_configurations(
        &self,
        app_name: &str,
        env_name: &str,
        include_values: bool,
    ) -> Result<HashMap<String, serde_json::Value>> {
        let url = format!(
            "{}/api/v1/configurations/app/{}/env/{}?includeValues={}",
            self.base_url, app_name, env_name, include_values
        );

        let response = self.client
            .get(&url)
            .send()
            .await
            .context("Failed to fetch configurations")?;

        if !response.status().is_success() {
            anyhow::bail!("API error: {}", response.status());
        }

        response
            .json()
            .await
            .context("Failed to parse configurations")
    }

    pub async fn set_configuration(
        &self,
        env_id: &str,
        key: &str,
        value: &str,
        sensitive: bool,
    ) -> Result<()> {
        let url = format!("{}/api/v1/configurations", self.base_url);

        let payload = serde_json::json!({
            "environmentId": env_id,
            "key": key,
            "value": value,
            "sensitive": sensitive,
            "type": "string",
        });

        let response = self.client
            .post(&url)
            .json(&payload)
            .send()
            .await
            .context("Failed to set configuration")?;

        if !response.status().is_success() {
            anyhow::bail!("API error: {}", response.status());
        }

        Ok(())
    }

    pub async fn create_application(
        &self,
        name: &str,
        description: Option<&str>,
        environments: Vec<String>,
    ) -> Result<Application> {
        let url = format!("{}/api/v1/applications", self.base_url);

        let payload = serde_json::json!({
            "name": name,
            "description": description,
            "environments": environments,
        });

        let response = self.client
            .post(&url)
            .json(&payload)
            .send()
            .await
            .context("Failed to create application")?;

        if !response.status().is_success() {
            anyhow::bail!("API error: {}", response.status());
        }

        response
            .json()
            .await
            .context("Failed to parse response")
    }
}
```

---

## 📝 Commands Implementation

### commands/pull.rs

```rust
use anyhow::Result;
use colored::*;
use std::collections::HashMap;
use std::fs;
use std::io::Write;

use crate::client::ConfigHubClient;

pub async fn pull_configs(
    client: &ConfigHubClient,
    app: &str,
    env: &str,
    format: &str,
    output: Option<&str>,
) -> Result<()> {
    println!("{} Fetching configurations for {}:{}...", "→".cyan(), app.bold(), env.bold());

    let configs = client.get_configurations(app, env, true).await?;

    let formatted = match format {
        "env" => format_as_env(&configs),
        "json" => serde_json::to_string_pretty(&configs)?,
        "yaml" => serde_yaml::to_string(&configs)?,
        _ => anyhow::bail!("Unsupported format: {}", format),
    };

    match output {
        Some(file_path) => {
            fs::write(file_path, &formatted)?;
            println!("{} Saved to {}", "✓".green(), file_path.bold());
        }
        None => {
            println!("{}", formatted);
        }
    }

    println!("{} Pulled {} configurations", "✓".green(), configs.len());

    Ok(())
}

fn format_as_env(configs: &HashMap<String, serde_json::Value>) -> String {
    configs
        .iter()
        .map(|(key, value)| {
            let val = match value {
                serde_json::Value::String(s) => s.clone(),
                _ => value.to_string(),
            };
            format!("{}={}", key, val)
        })
        .collect::<Vec<_>>()
        .join("\n")
}
```

### commands/apps.rs

```rust
use anyhow::Result;
use colored::*;
use comfy_table::{Table, presets::UTF8_FULL};

use crate::client::ConfigHubClient;

pub async fn list_apps(client: &ConfigHubClient) -> Result<()> {
    println!("{} Fetching applications...", "→".cyan());

    let apps = client.get_applications().await?;

    if apps.is_empty() {
        println!("{} No applications found", "!".yellow());
        return Ok(());
    }

    let mut table = Table::new();
    table
        .load_preset(UTF8_FULL)
        .set_header(vec!["Name", "Environments", "Status", "ID"]);

    for app in apps {
        let envs = app
            .environments
            .iter()
            .map(|e| e.name.as_str())
            .collect::<Vec<_>>()
            .join(", ");

        let status = if app.active {
            "Active".green()
        } else {
            "Inactive".red()
        };

        table.add_row(vec![
            app.name,
            envs,
            status.to_string(),
            app.id,
        ]);
    }

    println!("{}", table);
    println!("{} Found {} applications", "✓".green(), table.row_count() - 1);

    Ok(())
}

pub async fn create_app(
    client: &ConfigHubClient,
    name: &str,
    description: Option<&str>,
    envs: &str,
) -> Result<()> {
    let environments: Vec<String> = envs
        .split(',')
        .map(|s| s.trim().to_string())
        .collect();

    println!(
        "{} Creating application {} with environments: {}...",
        "→".cyan(),
        name.bold(),
        environments.join(", ")
    );

    let app = client.create_application(name, description, environments).await?;

    println!("{} Application created successfully!", "✓".green());
    println!("   ID: {}", app.id);
    println!("   Name: {}", app.name);

    Ok(())
}
```

---

## 🔧 Config Management (config/profile.rs)

```rust
use anyhow::{Context, Result};
use directories::ProjectDirs;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Serialize, Deserialize)]
pub struct Config {
    pub profiles: HashMap<String, Profile>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Profile {
    pub url: String,
    pub api_key: String,
}

impl Config {
    pub fn load() -> Result<Self> {
        let path = Self::config_path()?;

        if !path.exists() {
            return Ok(Self {
                profiles: HashMap::new(),
            });
        }

        let content = fs::read_to_string(&path)
            .context("Failed to read config file")?;

        toml::from_str(&content)
            .context("Failed to parse config file")
    }

    pub fn save(&self) -> Result<()> {
        let path = Self::config_path()?;

        if let Some(parent) = path.parent() {
            fs::create_dir_all(parent)?;
        }

        let content = toml::to_string_pretty(self)?;
        fs::write(&path, content)?;

        Ok(())
    }

    pub fn add_profile(&mut self, name: String, profile: Profile) {
        self.profiles.insert(name, profile);
    }

    pub fn get_profile(&self, name: &str) -> Option<&Profile> {
        self.profiles.get(name)
    }

    fn config_path() -> Result<PathBuf> {
        let proj_dirs = ProjectDirs::from("com", "confighub", "cli")
            .context("Failed to get project directories")?;

        Ok(proj_dirs.config_dir().join("config.toml"))
    }
}
```

---

## 🎯 Main Entry Point (main.rs)

```rust
use anyhow::Result;
use clap::Parser;
use colored::*;

mod cli;
mod client;
mod commands;
mod config;
mod utils;

use cli::{Cli, Commands, AppsCommands, ConfigCommands};
use client::ConfigHubClient;
use config::Config;

#[tokio::main]
async fn main() -> Result<()> {
    let cli = Cli::parse();

    if cli.verbose {
        tracing_subscriber::fmt()
            .with_max_level(tracing::Level::DEBUG)
            .init();
    }

    match cli.command {
        Commands::Login { url, api_key, profile } => {
            commands::login::login(url, api_key, profile)?;
        }

        Commands::Apps { command } => {
            let client = get_client(&cli.profile)?;

            match command {
                Some(AppsCommands::List) => {
                    commands::apps::list_apps(&client).await?;
                }
                Some(AppsCommands::Create { name, description, envs }) => {
                    commands::apps::create_app(&client, &name, description.as_deref(), &envs).await?;
                }
                Some(AppsCommands::Show { app }) => {
                    commands::apps::show_app(&client, &app).await?;
                }
                None => {
                    commands::apps::list_apps(&client).await?;
                }
            }
        }

        Commands::Pull { app, env, format, output } => {
            let client = get_client(&cli.profile)?;
            commands::pull::pull_configs(&client, &app, &env, &format, output.as_deref()).await?;
        }

        Commands::Export { app, env, include_sensitive } => {
            let client = get_client(&cli.profile)?;
            commands::export::export_configs(&client, &app, &env, include_sensitive).await?;
        }

        _ => {
            println!("{} Command not implemented yet", "!".yellow());
        }
    }

    Ok(())
}

fn get_client(profile_name: &Option<String>) -> Result<ConfigHubClient> {
    let config = Config::load()?;
    let profile_name = profile_name.as_deref().unwrap_or("default");

    let profile = config.get_profile(profile_name)
        .ok_or_else(|| anyhow::anyhow!("Profile '{}' not found. Run 'confighub login' first.", profile_name))?;

    ConfigHubClient::new(profile.url.clone(), profile.api_key.clone())
}
```

---

## 📚 Usage Examples

```bash
# Login
confighub login --url https://config.company.com --api-key abc123

# List applications
confighub apps list

# Create application
confighub apps create vendax --description "VendaX AI Platform" --envs "dev,staging,prod"

# Pull configurations
confighub pull vendax --env production --format env
confighub pull vendax --env prod --format json --output config.json

# List configurations
confighub config list vendax --env production

# Get specific config
confighub config get vendax --env prod database.url

# Set configuration
confighub config set vendax --env dev api.endpoint "http://localhost:3000"
confighub config set vendax --env prod db.password "secret" --sensitive

# Export as environment variables
export $(confighub export vendax --env production)

# Push local .env file
confighub push vendax --env dev --file .env.local

# Audit logs
confighub audit --app vendax --days 30

# Generate shell completions
confighub completions bash > /etc/bash_completion.d/confighub
```

---

## 🔨 Build & Installation

### Build from source

```bash
cargo build --release
```

### Install globally

```bash
cargo install --path .
```

### Cross-compilation (multiple platforms)

```bash
# Linux
cargo build --release --target x86_64-unknown-linux-gnu

# macOS
cargo build --release --target x86_64-apple-darwin

# Windows
cargo build --release --target x86_64-pc-windows-msvc
```

---

## 📦 Distribution

### Homebrew (macOS/Linux)

```ruby
# Formula
class Confighub < Formula
  desc "CLI tool for ConfigHub configuration management"
  homepage "https://github.com/confighub/confighub"
  url "https://github.com/confighub/confighub/archive/v1.0.0.tar.gz"
  sha256 "..."

  def install
    system "cargo", "install", *std_cargo_args
  end

  test do
    system "#{bin}/confighub", "--version"
  end
end
```

### Cargo (Rust)

```bash
cargo install confighub
```

### Binary releases (GitHub)

```bash
# Download and install
curl -L https://github.com/confighub/releases/download/v1.0.0/confighub-linux-amd64 -o confighub
chmod +x confighub
sudo mv confighub /usr/local/bin/
```

---

**Continuar para:** 07-DEPLOYMENT.md
