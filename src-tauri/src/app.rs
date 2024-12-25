use crate::api;
use crate::errors::ApiError;
use crate::services::project_service;
use crate::settings::Settings;
use crate::state::State;

pub async fn setup(settings: Settings) -> Result<State, ApiError> {
    let project = project_service::create(&settings, "My Wiki").await?;
    let state = State::new(settings, project.db);
    Ok(state)
}

pub fn attach_handlers<R>(builder: tauri::Builder<R>) -> tauri::Builder<R>
where
    R: tauri::Runtime,
{
    builder.invoke_handler(tauri::generate_handler![
        // session API
        api::session::get_session,
        // project API
        api::project::create_project,
        api::project::load_project,
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
