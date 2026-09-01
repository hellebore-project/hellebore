use uuid::Uuid;

use crate::model::{errors::Error, state::State};
use crate::schema::{
    common::{DiagnosticResponseSchema, PaginationRequestSchema, PaginationResponseSchema},
    word::{WordListRequestSchema, WordResponseSchema, WordUpsertResponseSchema, WordUpsertSchema},
};
use crate::services::{project_service, word_service};

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
pub async fn list_words(
    state: tauri::State<'_, State>,
    project_id: Uuid,
    args: Option<PaginationRequestSchema<WordListRequestSchema>>,
) -> Result<PaginationResponseSchema<WordResponseSchema>, Error> {
    let state = state.lock().await;
    let db = project_service::get_database(&state, project_id)?;
    word_service::list(db, args).await
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
