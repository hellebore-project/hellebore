use crate::api::utils;
use crate::model::errors::api_error::ApiError;
use crate::schema::project::ProjectResponseSchema;
use crate::services::project_service;
use crate::state::State;
use crate::types::entity::PROJECT;

#[tauri::command]
pub async fn create_project(
    state: tauri::State<'_, State>,
    name: &str,
    db_path: &str,
) -> Result<ProjectResponseSchema, ApiError> {
    let mut state = state.lock().await;
    let load_response = project_service::create(&mut state, name, db_path).await?;
    Ok(load_response.info)
}

#[tauri::command]
pub async fn load_project(
    state: tauri::State<'_, State>,
    db_path: &str,
) -> Result<ProjectResponseSchema, ApiError> {
    let mut state = state.lock().await;
    let load_response = project_service::load(&mut state, db_path).await?;
    Ok(load_response.info)
}

#[tauri::command]
pub async fn close_project(state: tauri::State<'_, State>) -> Result<(), ApiError> {
    let mut state = state.lock().await;
    project_service::close(&mut state).await?;
    Ok(())
}

#[tauri::command]
pub async fn update_project(
    state: tauri::State<'_, State>,
    name: &str,
) -> Result<ProjectResponseSchema, ApiError> {
    let state = state.lock().await;
    project_service::update(utils::get_database(&state)?, &name).await
}

#[tauri::command]
pub async fn get_project(
    state: tauri::State<'_, State>,
) -> Result<ProjectResponseSchema, ApiError> {
    let state = state.lock().await;
    match project_service::get(utils::get_database(&state)?).await? {
        Some(project) => Ok(project),
        None => Err(ApiError::not_found(
            "Project not found.".to_owned(),
            PROJECT,
        )),
    }
}
