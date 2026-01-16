use serde::de::DeserializeOwned;
use serde::Serialize;

#[derive(Clone)]
pub struct ApiClient {
    base_url: String,
    api_key: String,
    client: reqwest::Client,
}

impl ApiClient {
    pub fn new(base_url: String, api_key: String) -> Self {
        Self {
            base_url: base_url.trim_end_matches('/').to_string(),
            api_key,
            client: reqwest::Client::new(),
        }
    }

    pub async fn get<T: DeserializeOwned>(&self, path: &str) -> anyhow::Result<T> {
        let url = format!("{}{}", self.base_url, path);
        let response = self
            .client
            .get(url)
            .bearer_auth(&self.api_key)
            .send()
            .await?;

        Self::handle_response(response).await
    }

    pub async fn post<T: DeserializeOwned, B: Serialize>(
        &self,
        path: &str,
        body: &B,
    ) -> anyhow::Result<T> {
        let url = format!("{}{}", self.base_url, path);
        let response = self
            .client
            .post(url)
            .bearer_auth(&self.api_key)
            .json(body)
            .send()
            .await?;

        Self::handle_response(response).await
    }

    pub async fn put<T: DeserializeOwned, B: Serialize>(
        &self,
        path: &str,
        body: &B,
    ) -> anyhow::Result<T> {
        let url = format!("{}{}", self.base_url, path);
        let response = self
            .client
            .put(url)
            .bearer_auth(&self.api_key)
            .json(body)
            .send()
            .await?;

        Self::handle_response(response).await
    }

    pub async fn delete(&self, path: &str) -> anyhow::Result<()> {
        let url = format!("{}{}", self.base_url, path);
        let response = self
            .client
            .delete(url)
            .bearer_auth(&self.api_key)
            .send()
            .await?;

        Self::handle_empty_response(response).await
    }

    async fn handle_response<T: DeserializeOwned>(response: reqwest::Response) -> anyhow::Result<T> {
        if !response.status().is_success() {
            let status = response.status();
            let body = response.text().await.unwrap_or_default();
            anyhow::bail!("Request failed: {} - {}", status, body);
        }

        Ok(response.json::<T>().await?)
    }

    async fn handle_empty_response(response: reqwest::Response) -> anyhow::Result<()> {
        if !response.status().is_success() {
            let status = response.status();
            let body = response.text().await.unwrap_or_default();
            anyhow::bail!("Request failed: {} - {}", status, body);
        }

        Ok(())
    }
}
