use rstest::*;
use sea_orm::DatabaseConnection;

use hellebore::{
    database::setup,
    settings::{DatabaseSettings, Settings},
};

pub mod entry;
pub mod folder;
pub mod language;
pub mod word;

pub struct TestState {
    pub db: Option<DatabaseConnection>,
}

#[fixture]
#[once]
pub fn settings() -> Settings {
    Settings {
        data_dir_path: "".to_owned(),
        database: DatabaseSettings {
            file_path: Some("".to_owned()),
            in_memory: true,
        },
    }
}

pub async fn database(settings: &Settings) -> DatabaseConnection {
    setup::setup(settings).await.unwrap()
}
