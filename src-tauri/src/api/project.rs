use crate::model::{errors::Error, state::State};
use crate::schema::project::ProjectResponseSchema;
use crate::services::project_service;

#[tauri::command]
pub async fn create_project(
    state: tauri::State<'_, State>,
    name: String,
    folder_path: String,
    in_memory: bool,
) -> Result<ProjectResponseSchema, Error> {
    let mut state = state.lock().await;
    let response = project_service::create(&mut state, &name, &folder_path, in_memory).await?;
    Ok(response)
}

#[tauri::command]
pub async fn load_project(
    state: tauri::State<'_, State>,
    folder_path: Option<String>,
) -> Result<ProjectResponseSchema, Error> {
    let mut state = state.lock().await;
    let response = project_service::load(&mut state, &folder_path).await?;
    Ok(response)
}

#[tauri::command]
pub async fn close_project(state: tauri::State<'_, State>, id: String) -> Result<(), Error> {
    let mut state = state.lock().await;
    project_service::close(&mut state, &id).await?;
    Ok(())
}

#[tauri::command]
pub async fn update_project(
    state: tauri::State<'_, State>,
    id: String,
    name: String,
) -> Result<ProjectResponseSchema, Error> {
    let mut state = state.lock().await;
    let response = project_service::update(&mut state, &id, &name).await?;
    Ok(response)
}
