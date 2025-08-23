use crate::api::utils;
use crate::errors::ApiError;
use crate::schema::{
    entry::{EntryCreateSchema, EntryInfoResponseSchema},
    language::LanguageSchema,
};
use crate::services::language_service;
use crate::state::State;

#[tauri::command]
pub async fn create_language(
    state: tauri::State<'_, State>,
    entry: EntryCreateSchema<LanguageSchema>,
) -> Result<EntryInfoResponseSchema, ApiError> {
    let state = state.lock().await;
    language_service::create(utils::get_database(&state)?, entry).await
}
