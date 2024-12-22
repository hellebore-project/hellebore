use sea_orm::DatabaseConnection;

use crate::api;
use crate::database::database_manager;
use crate::errors::ApiError;
use crate::services::project_service;
use crate::settings::Settings;

pub struct AppState {
    pub settings: Settings,
    pub database: DatabaseConnection,
}

pub async fn setup(settings: Settings) -> Result<AppState, ApiError> {
    let db = database_manager::setup(&settings).await?;

    // TODO: fall back to an error state in the UI if the query fails
    let projects = project_service::get_all(&db)
        .await
        .expect("Failed to retrieve project.");

    if projects.is_empty() {
        project_service::create(&db, "My Wiki").await?;
    }

    let app = AppState {
        settings,
        database: db,
    };
    Ok(app)
}

pub fn attach_handlers<R>(builder: tauri::Builder<R>) -> tauri::Builder<R>
where
    R: tauri::Runtime,
{
    builder.invoke_handler(tauri::generate_handler![
        // project API
        api::project::update_project,
        api::project::get_project,
        // article API
        api::article::validate_article_title,
        api::article::get_articles,
        // folder API
        api::folder::create_folder,
        api::folder::update_folder,
        api::folder::validate_folder_name,
        api::folder::get_folder,
        api::folder::get_folders,
        api::folder::delete_folder,
        // language API
        api::language::create_language,
        api::language::update_language,
        api::language::get_language,
        api::language::delete_language,
        // person API
        api::person::create_person,
        api::person::update_person,
        api::person::get_person,
        api::person::delete_person,
    ])
}
