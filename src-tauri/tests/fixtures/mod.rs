use rstest::*;
use sea_orm::DatabaseConnection;

use hellebore::{
    database::database_manager,
    schema::{
        article::ArticleCreateSchema, folder::FolderCreateSchema, language::LanguageDataSchema,
    },
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
pub fn parent_folder_id() -> i32 {
    return -1;
}

#[fixture]
pub fn folder_name() -> String {
    return "folder".to_owned();
}

#[fixture]
pub fn folder_create_payload(parent_folder_id: i32, folder_name: String) -> FolderCreateSchema {
    FolderCreateSchema {
        parent_id: parent_folder_id,
        name: folder_name,
    }
}

#[fixture]
pub fn article_text() -> String {
    return "".to_string();
}

#[fixture]
pub fn language_name() -> String {
    return "French".to_string();
}

#[fixture]
pub fn create_language_payload(
    folder_id: i32,
    language_name: String,
) -> ArticleCreateSchema<LanguageDataSchema> {
    let language = LanguageDataSchema {
        name: language_name,
    };
    ArticleCreateSchema {
        folder_id,
        title: language.name.to_string(),
        data: language,
    }
}
