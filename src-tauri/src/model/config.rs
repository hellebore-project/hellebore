pub const DEFAULT_DB_FILE_NAME: &str = "db.sqlite";

pub struct DatabaseConfig {
    pub in_memory: bool,
}

pub struct AppConfig {
    pub folder_path: Option<String>,
    pub database: DatabaseConfig,
}

impl Default for AppConfig {
    fn default() -> Self {
        AppConfig {
            folder_path: None,
            database: DatabaseConfig { in_memory: false },
        }
    }
}

impl AppConfig {
    pub fn get_connection_string(&self) -> Option<String> {
        if self.database.in_memory {
            return Some("sqlite::memory:".to_string());
        }
        self.folder_path
            .as_ref()
            .map(|path| format!("sqlite://{0}/{1}?mode=rwc", path, DEFAULT_DB_FILE_NAME))
    }
}
