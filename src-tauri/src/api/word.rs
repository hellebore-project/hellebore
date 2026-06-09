use crate::api::utils;
use crate::model::{errors::Error, state::State};
use crate::schema::{
    common::DiagnosticResponseSchema,
    word::{WordResponseSchema, WordUpsertResponseSchema, WordUpsertSchema},
};
use crate::services::word_service;
use crate::types::grammar::WordType;

#[tauri::command]
pub async fn upsert_words(
    state: tauri::State<'_, State>,
    words: Vec<WordUpsertSchema>,
) -> Result<Vec<DiagnosticResponseSchema<WordUpsertResponseSchema>>, Error> {
    // TODO: need a clearer API response
    let state = state.lock().await;
    word_service::bulk_upsert(utils::get_database(&state)?, words).await
}

#[tauri::command]
pub async fn get_word(
    state: tauri::State<'_, State>,
    id: i32,
) -> Result<WordResponseSchema, Error> {
    let state = state.lock().await;
    word_service::get(utils::get_database(&state)?, id).await
}

#[tauri::command]
pub async fn get_words(
    state: tauri::State<'_, State>,
    language_id: i32,
    word_type: Option<WordType>,
) -> Result<Vec<WordResponseSchema>, Error> {
    let state = state.lock().await;
    word_service::get_all_for_language(utils::get_database(&state)?, language_id, word_type).await
}

#[tauri::command]
pub async fn delete_word(state: tauri::State<'_, State>, id: i32) -> Result<(), Error> {
    let state = state.lock().await;
    word_service::delete(utils::get_database(&state)?, id).await
}
