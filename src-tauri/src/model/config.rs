#[derive(Default)]
pub struct AppConfig {
    // project IDs are ephemeral; the most durable way to remember projects is by their folder paths
    pub recent_project_paths: Vec<String>,
}

impl AppConfig {
    pub fn add_recent_project(&mut self, path: &str) {
        self.recent_project_paths.retain(|p| p != path);
        self.recent_project_paths.insert(0, path.to_string());
    }
}
