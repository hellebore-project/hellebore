use crate::api::utils;
use crate::model::errors::error::Error;
use crate::schema::project::ProjectResponseSchema;
use crate::services::project_service;
use crate::state::State;
use crate::types::entity::PROJECT;

#[tauri::command]
pub async fn create_project(
    state: tauri::State<'_, State>,
    name: &str,
    folder_path: &str,
) -> Result<ProjectResponseSchema, Error> {
    let mut state = state.lock().await;
    let load_response = project_service::create(&mut state, name, folder_path).await?;
    Ok(load_response.info)
}

#[tauri::command]
pub async fn load_project(
    state: tauri::State<'_, State>,
    folder_path: &str,
) -> Result<ProjectResponseSchema, Error> {
    let mut state = state.lock().await;
    let load_response = project_service::load(&mut state, folder_path).await?;
    Ok(load_response.info)
}

#[tauri::command]
pub async fn close_project(state: tauri::State<'_, State>) -> Result<(), Error> {
    let mut state = state.lock().await;
    project_service::close(&mut state).await?;
    Ok(())
}

#[tauri::command]
pub async fn update_project(
    state: tauri::State<'_, State>,
    name: &str,
) -> Result<ProjectResponseSchema, Error> {
    let state = state.lock().await;
    project_service::update(utils::get_database(&state)?, &name).await
}

#[tauri::command]
pub async fn get_project(state: tauri::State<'_, State>) -> Result<ProjectResponseSchema, Error> {
    let state = state.lock().await;
    match project_service::get(utils::get_database(&state)?).await? {
        Some(project) => Ok(project),
        None => Err(Error::not_found("Project not found.", PROJECT)),
    }
}
