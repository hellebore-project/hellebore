use crate::api::utils;
use crate::model::errors::api_error::ApiError;
use crate::schema::{
    common::DiagnosticResponseSchema,
    entry::{
        EntryArticleResponseSchema, EntryCreateSchema, EntryInfoResponseSchema,
        EntryPropertyResponseSchema, EntryUpdateResponseSchema, EntryUpdateSchema,
    },
};
use crate::services::entry_service;
use crate::state::State;

#[tauri::command]
pub async fn create_entry(
    state: tauri::State<'_, State>,
    entry: EntryCreateSchema,
) -> Result<EntryInfoResponseSchema, ApiError> {
    let state = state.lock().await;
    entry_service::create(utils::get_database(&state)?, entry).await
}

#[tauri::command]
pub async fn update_entry(
    state: tauri::State<'_, State>,
    entry: EntryUpdateSchema,
) -> Result<DiagnosticResponseSchema<EntryUpdateResponseSchema>, ApiError> {
    let state = state.lock().await;
    Ok(entry_service::update(utils::get_database(&state)?, entry).await)
}

#[tauri::command]
pub async fn update_entries(
    state: tauri::State<'_, State>,
    entries: Vec<EntryUpdateSchema>,
) -> Result<Vec<DiagnosticResponseSchema<EntryUpdateResponseSchema>>, ApiError> {
    let state = state.lock().await;
    Ok(entry_service::bulk_update(utils::get_database(&state)?, entries).await)
}

#[tauri::command]
pub async fn validate_entry_title(
    state: tauri::State<'_, State>,
    id: Option<i32>,
    title: &str,
) -> Result<DiagnosticResponseSchema<bool>, ApiError> {
    let state = state.lock().await;
    entry_service::validate_title(utils::get_database(&state)?, id, title).await
}

#[tauri::command]
pub async fn get_entry(
    state: tauri::State<'_, State>,
    id: i32,
) -> Result<EntryInfoResponseSchema, ApiError> {
    let state = state.lock().await;
    entry_service::get_info(utils::get_database(&state)?, id).await
}

#[tauri::command]
pub async fn get_entry_properties(
    state: tauri::State<'_, State>,
    id: i32,
) -> Result<EntryPropertyResponseSchema, ApiError> {
    let state = state.lock().await;
    entry_service::get_properties(utils::get_database(&state)?, id).await
}

#[tauri::command]
pub async fn get_entry_text(
    state: tauri::State<'_, State>,
    id: i32,
) -> Result<EntryArticleResponseSchema, ApiError> {
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

#[tauri::command]
pub async fn search_entries(
    state: tauri::State<'_, State>,
    keyword: &str,
) -> Result<Vec<EntryInfoResponseSchema>, ApiError> {
    let state = state.lock().await;
    entry_service::search(utils::get_database(&state)?, keyword).await
}

#[tauri::command]
pub async fn delete_entry(state: tauri::State<'_, State>, id: i32) -> Result<(), ApiError> {
    let state = state.lock().await;
    entry_service::delete(utils::get_database(&state)?, id).await
}
