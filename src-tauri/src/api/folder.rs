use crate::api::util;
use crate::errors::ApiError;
use crate::schema::{
    folder::{FolderCreateSchema, FolderResponseSchema, FolderUpdateSchema},
    response::ResponseDiagnosticsSchema,
};
use crate::services::folder_service;
use crate::state::State;

#[tauri::command]
pub async fn create_folder(
    state: tauri::State<'_, State>,
    info: FolderCreateSchema,
) -> Result<FolderResponseSchema, ApiError> {
    let state = state.lock().await;
    folder_service::create(util::get_database(&state)?, info).await
}

#[tauri::command]
pub async fn update_folder(
    state: tauri::State<'_, State>,
    folder: FolderUpdateSchema,
) -> Result<FolderResponseSchema, ApiError> {
    let state = state.lock().await;
    folder_service::update(util::get_database(&state)?, folder).await
}

#[tauri::command(rename_all = "snake_case")]
pub async fn validate_folder_name(
    state: tauri::State<'_, State>,
    id: Option<i32>,
    parent_id: i32,
    name: &str,
) -> Result<ResponseDiagnosticsSchema<bool>, ApiError> {
    let state = state.lock().await;
    folder_service::validate_name(util::get_database(&state)?, id, parent_id, name).await
}

#[tauri::command]
pub async fn get_folder(
    state: tauri::State<'_, State>,
    id: i32,
) -> Result<FolderResponseSchema, ApiError> {
    let state = state.lock().await;
    folder_service::get(util::get_database(&state)?, id).await
}

#[tauri::command]
pub async fn get_folders(
    state: tauri::State<'_, State>,
) -> Result<Vec<FolderResponseSchema>, ApiError> {
    let state = state.lock().await;
    folder_service::get_all(util::get_database(&state)?).await
}

#[tauri::command]
pub async fn delete_folder(state: tauri::State<'_, State>, id: i32) -> Result<(), ApiError> {
    let state = state.lock().await;
    folder_service::delete(util::get_database(&state)?, id).await
}
