use crate::api::utils;
use crate::errors::ApiError;
use crate::schema::{
    entry::{EntryCreateSchema, EntryInfoSchema},
    language::LanguageDataSchema,
};
use crate::services::language_service;
use crate::state::State;

#[tauri::command]
pub async fn create_language(
    state: tauri::State<'_, State>,
    entity: EntryCreateSchema<LanguageDataSchema>,
) -> Result<EntryInfoSchema, ApiError> {
    let state = state.lock().await;
    language_service::create(utils::get_database(&state)?, entity).await
}

#[tauri::command]
pub async fn delete_language(state: tauri::State<'_, State>, id: i32) -> Result<(), ApiError> {
    let state = state.lock().await;
    language_service::delete(utils::get_database(&state)?, id).await
}
