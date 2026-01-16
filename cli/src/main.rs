mod cli;
mod client;
mod commands;
mod config;

use clap::Parser;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let cli = cli::Cli::parse();
    commands::run(cli).await
}
