#[derive(serde::Serialize, serde::Deserialize)]
pub struct AppConfigFileSchema {
    #[serde(default)]
    pub recent_projects: Vec<String>,
}
