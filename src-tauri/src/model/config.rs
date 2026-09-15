use log::LevelFilter;

pub struct AppConfig {
    // project IDs are ephemeral; the most durable way to remember projects is by their folder paths
    pub recent_project_paths: Vec<String>,
    pub log_level: LevelFilter,
}

impl Default for AppConfig {
    fn default() -> Self {
        AppConfig {
            recent_project_paths: vec![],
            log_level: LevelFilter::Info,
        }
    }
}

impl AppConfig {
    pub fn add_recent_project(&mut self, path: &str) {
        self.recent_project_paths.retain(|p| p != path);
        self.recent_project_paths.insert(0, path.to_string());
    }
}
