use std::env;
use std::fs;

use rstest::*;
use uuid::Uuid;

use hellebore::{model::config::AppConfig, schema::config::AppConfigFileSchema};

pub struct TempConfigDir {
    path: String,
}

impl TempConfigDir {
    pub fn path(&self) -> &str {
        &self.path
    }
}

impl Drop for TempConfigDir {
    fn drop(&mut self) {
        let _ = fs::remove_dir_all(&self.path);
    }
}

#[fixture]
pub fn temp_config_dir() -> TempConfigDir {
    let path = env::temp_dir().join(format!("hellebore-config-tests-{}", Uuid::new_v4()));
    fs::create_dir_all(&path).unwrap();

    TempConfigDir {
        path: path.to_string_lossy().to_string(),
    }
}

#[fixture]
pub fn app_config() -> AppConfig {
    AppConfig {
        recent_project_paths: vec![
            "/tmp/hellebore-project-a".to_string(),
            "/tmp/hellebore-project-b".to_string(),
        ],
    }
}

#[fixture]
pub fn app_config_file_schema() -> AppConfigFileSchema {
    AppConfigFileSchema {
        recent_projects: vec![
            "/tmp/hellebore-project-a".to_string(),
            "/tmp/hellebore-project-b".to_string(),
        ],
    }
}
