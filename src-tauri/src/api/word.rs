use crate::api::util;
use crate::errors::ApiError;
use crate::schema::{
    response::ResponseDiagnosticsSchema,
    word::{WordCreateSchema, WordResponseSchema, WordUpdateSchema},
};
use crate::services::word_service;
use crate::state::State;
use crate::types::WordType;

#[tauri::command]
pub async fn create_word(
    state: tauri::State<'_, State>,
    word: WordCreateSchema,
) -> Result<WordResponseSchema, ApiError> {
    let state = state.lock().await;
    word_service::create(util::get_database(&state)?, word).await
}

#[tauri::command]
pub async fn update_word(
    state: tauri::State<'_, State>,
    word: WordUpdateSchema,
) -> Result<ResponseDiagnosticsSchema<()>, ApiError> {
    let state = state.lock().await;
    word_service::update(util::get_database(&state)?, word).await
}

#[tauri::command]
pub async fn get_word(
    state: tauri::State<'_, State>,
    id: i32,
) -> Result<WordResponseSchema, ApiError> {
    let state = state.lock().await;
    word_service::get(util::get_database(&state)?, id).await
}

#[tauri::command]
pub async fn get_words(
    state: tauri::State<'_, State>,
    language_id: i32,
    word_type: Option<WordType>,
) -> Result<Vec<WordResponseSchema>, ApiError> {
    let state = state.lock().await;
    word_service::get_multiple(util::get_database(&state)?, language_id, word_type).await
}

#[tauri::command]
pub async fn delete_word(state: tauri::State<'_, State>, id: i32) -> Result<(), ApiError> {
    let state = state.lock().await;
    word_service::delete(util::get_database(&state)?, id).await
}
