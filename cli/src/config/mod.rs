use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Profile {
    pub name: String,
    pub base_url: String,
    pub api_key: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CliConfig {
    pub profiles: Vec<Profile>,
}

impl CliConfig {
    pub fn load() -> anyhow::Result<Self> {
        let path = config_path()?;
        if !path.exists() {
            return Ok(CliConfig { profiles: vec![] });
        }

        let content = fs::read_to_string(path)?;
        let config = serde_json::from_str(&content)?;
        Ok(config)
    }

    pub fn save(&self) -> anyhow::Result<()> {
        let path = config_path()?;
        if let Some(parent) = path.parent() {
            fs::create_dir_all(parent)?;
        }
        let content = serde_json::to_string_pretty(self)?;
        fs::write(path, content)?;
        Ok(())
    }

    pub fn upsert_profile(&mut self, profile: Profile) {
        if let Some(existing) = self.profiles.iter_mut().find(|p| p.name == profile.name) {
            *existing = profile;
        } else {
            self.profiles.push(profile);
        }
    }

    pub fn get_profile(&self, name: &str) -> Option<&Profile> {
        self.profiles.iter().find(|p| p.name == name)
    }
}

fn config_path() -> anyhow::Result<PathBuf> {
    let home = std::env::var("HOME")?;
    Ok(PathBuf::from(home).join(".devkit").join("config.json"))
}
