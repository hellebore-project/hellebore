use rstest::*;
use sea_orm::DatabaseConnection;

use hellebore::{
    database::database_manager,
    schema::folder::FolderCreateSchema,
    settings::{DatabaseSettings, Settings},
};

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
    database_manager::setup(settings).await.unwrap()
}

#[fixture]
pub fn folder_id() -> i32 {
    return -1;
}

#[fixture]
pub fn folder_name() -> String {
    return "folder".to_owned();
}

#[fixture]
pub fn folder_create_payload(folder_name: String) -> FolderCreateSchema {
    FolderCreateSchema {
        parent_id: -1,
        name: folder_name,
    }
}

#[fixture]
pub fn article_text() -> String {
    return "".to_string();
}
