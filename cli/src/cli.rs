use clap::{Parser, Subcommand};

#[derive(Parser)]
#[command(
    name = "devkit",
    about = "DevKit CLI - Manage configurations",
    version,
    long_about = None
)]
pub struct Cli {
    #[command(subcommand)]
    pub command: Commands,

    /// Profile name
    #[arg(short, long, global = true, default_value = "default")]
    pub profile: String,
}

#[derive(Subcommand)]
pub enum Commands {
    /// Save API key + base URL
    Login {
        #[arg(short, long)]
        url: String,
        #[arg(short, long)]
        api_key: String,
    },

    /// Manage configurations
    Config {
        #[command(subcommand)]
        command: ConfigCommands,
    },

    /// Manage applications
    Apps {
        #[command(subcommand)]
        command: AppsCommands,
    },

    /// Manage secrets
    Secrets {
        #[command(subcommand)]
        command: SecretsCommands,
    },
}

#[derive(Subcommand)]
pub enum ConfigCommands {
    /// List configurations for an environment
    List {
        #[arg(short, long)]
        environment: String,
    },

    /// Get configuration value
    Get {
        #[arg(short, long)]
        environment: String,
        key: String,
    },

    /// Set configuration value
    Set {
        #[arg(short, long)]
        environment: String,
        key: String,
        value: String,
        #[arg(long, default_value = "STRING")]
        config_type: String,
        #[arg(long, default_value = "false")]
        secret: bool,
    },

    /// Update configuration
    Update {
        id: String,
        value: String,
        #[arg(long, default_value = "STRING")]
        config_type: String,
        #[arg(long)]
        description: Option<String>,
        #[arg(long, default_value = "false")]
        secret: bool,
    },

    /// Delete configuration
    Delete {
        id: String,
    },
}

#[derive(Subcommand)]
pub enum AppsCommands {
    /// List applications
    List,

    /// Create application
    Create {
        name: String,
        #[arg(short, long)]
        description: Option<String>,
        #[arg(short, long)]
        owner_email: String,
    },

    /// Show application by id
    Show {
        id: String,
    },

    /// Update application
    Update {
        id: String,
        #[arg(short, long)]
        name: Option<String>,
        #[arg(short, long)]
        description: Option<String>,
    },
}

#[derive(Subcommand)]
pub enum SecretsCommands {
    /// List secrets for an application
    List {
        application: String,
        #[arg(short, long)]
        environment: Option<String>,
    },

    /// Get decrypted secret
    Get {
        id: String,
    },

    /// Create secret
    Create {
        key: String,
        encrypted_value: String,
        #[arg(short, long)]
        description: Option<String>,
        #[arg(short, long)]
        application: String,
        #[arg(short, long)]
        environment: Option<String>,
        #[arg(short, long, default_value = "MANUAL")]
        rotation_policy: String,
    },

    /// Rotate secret
    Rotate {
        id: String,
        new_encrypted_value: String,
        rotated_by: String,
    },

    /// Deactivate secret
    Deactivate {
        id: String,
    },

    /// Delete secret
    Delete {
        id: String,
    },

    /// Get rotation history for a secret
    Rotations {
        secret_id: String,
    },

    /// Get rotation history for an application
    AppRotations {
        application: String,
    },

    /// Validate secrets rotation status
    Validate {
        #[arg(short, long)]
        application: Option<String>,
    },

    /// Get rotation statistics
    Stats {
        #[arg(short, long)]
        application: Option<String>,
    },

    /// Get recent rotations
    Recent {
        #[arg(short, long, default_value = "7")]
        days: i32,
    },

    /// Trigger automatic rotation for due secrets
    RotateDue {
        #[arg(short, long)]
        application: Option<String>,
    },
}
