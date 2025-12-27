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

pub mod person;

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

// The database needs to be a function-scoped static fixture that is
// called exactly once per test. rstest currently doesn't support this,
// since the [once] macro creates session-scoped static fixtures.
// It's not ideal, but we have to call the database fixture as an
// ordinary function inside the body of each test.
pub async fn database(settings: &Settings) -> DatabaseConnection {
    setup::setup(settings).await.unwrap()
}
