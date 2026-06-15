use sea_orm::DatabaseConnection;
use uuid::Uuid;

use crate::constants::DEFAULT_DB_FILE_NAME;

pub struct DatabaseConfig {
    pub in_memory: bool,
    pub connection: DatabaseConnection,
}

pub struct Project {
    pub id: Uuid,
    pub name: String,
    pub folder_path: String,
    pub database: DatabaseConfig,
}

impl Project {
    pub fn new(id: Uuid, name: String, folder_path: String, database: DatabaseConfig) -> Self {
        Self {
            id,
            name,
            folder_path,
            database,
        }
    }

    pub fn get_connection_string(&self) -> String {
        Self::generate_connection_string(&self.folder_path, self.database.in_memory)
    }

    pub fn generate_in_memory_connection_string() -> String {
        "sqlite::memory:".to_string()
    }

    pub fn generate_connection_string(folder_path: &str, in_memory: bool) -> String {
        if in_memory {
            return Project::generate_in_memory_connection_string();
        }
        format!(
            "sqlite://{0}/{1}?mode=rwc",
            folder_path, DEFAULT_DB_FILE_NAME
        )
    }
}
