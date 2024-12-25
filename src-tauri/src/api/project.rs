use crate::errors::ApiError;
use crate::schema::project::ProjectResponseSchema;
use crate::services::project_service;
use crate::state::State;
use crate::types::PROJECT;

#[tauri::command]
pub async fn create_project(
    state: tauri::State<'_, State>,
    name: &str,
    db_path: &str,
) -> Result<ProjectResponseSchema, ApiError> {
    let mut state = state.get_data().await;
    state.settings.database.file_path = db_path.to_string();
    state.settings.write_config_file();

    let load_response = project_service::create(&state.settings, &name).await?;
    Ok(load_response.info)
}

#[tauri::command]
pub async fn load_project(
    state: tauri::State<'_, State>,
    db_path: &str,
) -> Result<ProjectResponseSchema, ApiError> {
    let mut state = state.get_data().await;
    state.settings.database.file_path = db_path.to_string();
    state.settings.write_config_file();

    let load_response = project_service::load(&state.settings).await?;
    Ok(load_response.info)
}

#[tauri::command]
pub async fn update_project(
    state: tauri::State<'_, State>,
    name: &str,
) -> Result<ProjectResponseSchema, ApiError> {
    let state = state.get_data().await;
    project_service::update(&state.database, &name).await
}

#[tauri::command]
pub async fn get_project(
    state: tauri::State<'_, State>,
) -> Result<ProjectResponseSchema, ApiError> {
    let state = state.get_data().await;
    match project_service::get(&state.database).await? {
        Some(project) => Ok(project),
        None => Err(ApiError::not_found(
            "Project not found.".to_owned(),
            PROJECT,
        )),
    }
}
