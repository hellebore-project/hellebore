use crate::app::AppState;
use crate::errors::ApiError;
use crate::schema::project::ProjectResponseSchema;
use crate::services::project_service;
use crate::types::PROJECT;

#[tauri::command]
pub async fn update_project(
    state: tauri::State<'_, AppState>,
    name: &str,
) -> Result<ProjectResponseSchema, ApiError> {
    project_service::update(&state.database, &name).await
}

#[tauri::command]
pub async fn get_project(
    state: tauri::State<'_, AppState>,
) -> Result<ProjectResponseSchema, ApiError> {
    match project_service::get(&state.database).await? {
        Some(project) => Ok(project),
        None => Err(ApiError::not_found(
            "Project not found.".to_owned(),
            PROJECT,
        )),
    }
}
