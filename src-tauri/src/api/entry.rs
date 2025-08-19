use crate::api::utils;
use crate::errors::ApiError;
use crate::schema::{entry::EntryInfoResponseSchema, response::ResponseDiagnosticsSchema};
use crate::services::entry_service;
use crate::state::State;

#[tauri::command]
pub async fn update_entry_title(
    state: tauri::State<'_, State>,
    id: i32,
    title: String,
) -> Result<(), ApiError> {
    let state = state.lock().await;
    entry_service::update_title(utils::get_database(&state)?, id, title).await
}

#[tauri::command]
pub async fn update_entry_folder(
    state: tauri::State<'_, State>,
    id: i32,
    folder_id: i32,
) -> Result<(), ApiError> {
    let state = state.lock().await;
    entry_service::update_folder(utils::get_database(&state)?, id, folder_id).await
}

#[tauri::command]
pub async fn update_entry_text(
    state: tauri::State<'_, State>,
    id: i32,
    text: String,
) -> Result<(), ApiError> {
    let state = state.lock().await;
    entry_service::update_text(utils::get_database(&state)?, id, text).await
}

#[tauri::command]
pub async fn validate_entry_title(
    state: tauri::State<'_, State>,
    id: Option<i32>,
    title: &str,
) -> Result<ResponseDiagnosticsSchema<bool>, ApiError> {
    let state = state.lock().await;
    entry_service::validate_title(utils::get_database(&state)?, id, title).await
}

#[tauri::command]
pub async fn get_entry_text(
    state: tauri::State<'_, State>,
    id: i32,
) -> Result<Option<String>, ApiError> {
    let state = state.lock().await;
    entry_service::get_text(utils::get_database(&state)?, id).await
}

#[tauri::command]
pub async fn get_entries(
    state: tauri::State<'_, State>,
) -> Result<Vec<EntryInfoResponseSchema>, ApiError> {
    let state = state.lock().await;
    entry_service::get_all(utils::get_database(&state)?).await
}
