use crate::app::AppState;
use crate::errors::ApiError;
use crate::schema::folder::{FolderInfoSchema, FolderResponseSchema};
use crate::services::folder_service;

#[tauri::command]
pub async fn create_folder(
    state: tauri::State<'_, AppState>,
    data: FolderInfoSchema,
) -> Result<FolderResponseSchema, ApiError> {
    folder_service::create(&state.database, &data).await
}

#[tauri::command]
pub async fn update_folder(
    state: tauri::State<'_, AppState>,
    folder: FolderResponseSchema,
) -> Result<FolderResponseSchema, ApiError> {
    folder_service::update(&state.database, &folder).await
}

#[tauri::command]
pub async fn get_folder(
    state: tauri::State<'_, AppState>,
    id: i32,
) -> Result<FolderResponseSchema, ApiError> {
    folder_service::get(&state.database, id).await
}

#[tauri::command]
pub async fn delete_folder(state: tauri::State<'_, AppState>, id: i32) -> Result<(), ApiError> {
    folder_service::delete(&state.database, id).await
}
