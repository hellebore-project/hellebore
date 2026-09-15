use log::LevelFilter;

fn default_log_level() -> LevelFilter {
    LevelFilter::Info
}

#[derive(serde::Serialize, serde::Deserialize)]
pub struct AppConfigFileSchema {
    #[serde(default)]
    pub recent_projects: Vec<String>,
    #[serde(default = "default_log_level")]
    pub log_level: LevelFilter,
}

impl Default for AppConfigFileSchema {
    fn default() -> Self {
        AppConfigFileSchema {
            recent_projects: vec![],
            log_level: default_log_level(),
        }
    }
}
