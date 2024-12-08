use crate::app::AppState;
use crate::errors::ApiError;
use crate::schema::{
    folder::{FolderInfoSchema, FolderSchema},
    response::ResponseSchema,
};
use crate::services::folder_service;

#[tauri::command]
pub async fn create_folder(
    state: tauri::State<'_, AppState>,
    info: FolderInfoSchema,
) -> Result<FolderSchema, ApiError> {
    folder_service::create(&state.database, &info).await
}

#[tauri::command]
pub async fn update_folder(
    state: tauri::State<'_, AppState>,
    folder: FolderSchema,
) -> Result<FolderSchema, ApiError> {
    folder_service::update(&state.database, &folder).await
}

#[tauri::command(rename_all = "snake_case")]
pub async fn validate_folder_name(
    state: tauri::State<'_, AppState>,
    id: Option<i32>,
    parent_id: i32,
    name: &str,
) -> Result<ResponseSchema<bool>, ApiError> {
    folder_service::validate_name(&state.database, id, parent_id, name).await
}

#[tauri::command]
pub async fn get_folder(
    state: tauri::State<'_, AppState>,
    id: i32,
) -> Result<FolderSchema, ApiError> {
    folder_service::get(&state.database, id).await
}

#[tauri::command]
pub async fn get_folders(state: tauri::State<'_, AppState>) -> Result<Vec<FolderSchema>, ApiError> {
    folder_service::get_all(&state.database).await
}

#[tauri::command]
pub async fn delete_folder(state: tauri::State<'_, AppState>, id: i32) -> Result<(), ApiError> {
    folder_service::delete(&state.database, id).await
}
