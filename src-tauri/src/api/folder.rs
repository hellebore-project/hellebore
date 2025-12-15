use crate::api::utils;
use crate::errors::ApiError;
use crate::schema::folder::FolderValidationSchema;
use crate::schema::{
    diagnostic::ResponseDiagnosticsSchema,
    folder::{FolderCreateSchema, FolderResponseSchema, FolderUpdateSchema},
};
use crate::services::folder_service;
use crate::state::State;

#[tauri::command]
pub async fn create_folder(
    state: tauri::State<'_, State>,
    info: FolderCreateSchema,
) -> Result<FolderResponseSchema, ApiError> {
    let state = state.lock().await;
    folder_service::create(utils::get_database(&state)?, info).await
}

#[tauri::command]
pub async fn update_folder(
    state: tauri::State<'_, State>,
    folder: FolderUpdateSchema,
) -> Result<FolderResponseSchema, ApiError> {
    let state = state.lock().await;
    folder_service::update(utils::get_database(&state)?, folder).await
}

#[tauri::command]
pub async fn validate_folder_name(
    state: tauri::State<'_, State>,
    id: Option<i32>,
    parent_id: i32,
    name: &str,
) -> Result<ResponseDiagnosticsSchema<FolderValidationSchema>, ApiError> {
    let state = state.lock().await;
    folder_service::validate_name(utils::get_database(&state)?, id, parent_id, name).await
}

#[tauri::command]
pub async fn get_folder(
    state: tauri::State<'_, State>,
    id: i32,
) -> Result<FolderResponseSchema, ApiError> {
    let state = state.lock().await;
    folder_service::get(utils::get_database(&state)?, id).await
}

#[tauri::command]
pub async fn get_folders(
    state: tauri::State<'_, State>,
) -> Result<Vec<FolderResponseSchema>, ApiError> {
    let state = state.lock().await;
    folder_service::get_all(utils::get_database(&state)?).await
}

#[tauri::command]
pub async fn delete_folder(state: tauri::State<'_, State>, id: i32) -> Result<(), ApiError> {
    let state = state.lock().await;
    folder_service::delete(utils::get_database(&state)?, id).await
}
