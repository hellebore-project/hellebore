use uuid::Uuid;

use crate::model::{errors::Error, state::State};
use crate::schema::{
    common::DiagnosticResponseSchema,
    word::{WordResponseSchema, WordUpsertResponseSchema, WordUpsertSchema},
};
use crate::services::{project_service, word_service};
use crate::types::grammar::WordType;

#[tauri::command]
pub async fn upsert_words(
    state: tauri::State<'_, State>,
    project_id: Uuid,
    words: Vec<WordUpsertSchema>,
) -> Result<Vec<DiagnosticResponseSchema<WordUpsertResponseSchema>>, Error> {
    // TODO: need a clearer API response
    let state = state.lock().await;
    let db = project_service::get_database(&state, project_id)?;
    word_service::bulk_upsert(db, words).await
}

#[tauri::command]
pub async fn get_word(
    state: tauri::State<'_, State>,
    project_id: Uuid,
    id: Uuid,
) -> Result<WordResponseSchema, Error> {
    let state = state.lock().await;
    let db = project_service::get_database(&state, project_id)?;
    word_service::get(db, id).await
}

#[tauri::command]
pub async fn get_words(
    state: tauri::State<'_, State>,
    project_id: Uuid,
    language_id: Uuid,
    word_type: Option<WordType>,
) -> Result<Vec<WordResponseSchema>, Error> {
    let state = state.lock().await;
    let db = project_service::get_database(&state, project_id)?;
    word_service::get_all_for_language(db, language_id, word_type).await
}

#[tauri::command]
pub async fn delete_word(
    state: tauri::State<'_, State>,
    project_id: Uuid,
    id: Uuid,
) -> Result<(), Error> {
    let state = state.lock().await;
    let db = project_service::get_database(&state, project_id)?;
    word_service::delete(db, id).await
}
