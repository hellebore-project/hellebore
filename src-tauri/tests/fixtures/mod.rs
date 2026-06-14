use rstest::*;
use sea_orm::DatabaseConnection;

use hellebore::{
    database::setup,
    model::{config::AppConfig, project::Project},
};

pub mod config;
pub mod entry;
pub mod folder;
pub mod language;
pub mod person;
pub mod project;
pub mod word;

#[fixture]
#[once]
pub fn default_app_config() -> AppConfig {
    AppConfig {
        recent_project_paths: vec![],
    }
}

// The database needs to be a function-scoped static fixture that is
// called exactly once per test. rstest currently doesn't support this,
// since the [once] macro creates session-scoped static fixtures.
// It's not ideal, but we have to call the database fixture as an
// ordinary function inside the body of each test.
pub async fn database() -> DatabaseConnection {
    let connection_string = Project::generate_in_memory_connection_string();
    setup::setup_db(&connection_string).await.unwrap()
}
