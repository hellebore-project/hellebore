use sea_orm::DatabaseConnection;

use crate::api;
use crate::database::database_manager;
use crate::settings::Settings;

pub struct AppState {
    pub settings: Settings,
    pub database: DatabaseConnection,
}

pub async fn setup(settings: Settings) -> AppState {
    let db = database_manager::setup(&settings).await;
    AppState {
        settings,
        database: db,
    }
}

pub fn attach_handlers<R>(builder: tauri::Builder<R>) -> tauri::Builder<R>
where
    R: tauri::Runtime,
{
    builder.invoke_handler(tauri::generate_handler![
        // article API
        api::article::get_articles,
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
