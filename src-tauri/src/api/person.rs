use crate::api::utils;
use crate::errors::ApiError;
use crate::schema::{
    entry::{
        EntryCreateSchema, EntryInfoResponseSchema, EntryUpdateSchema,
        GenericEntryPropertyResponseSchema,
    },
    person::PersonSchema,
};
use crate::services::person_service;
use crate::state::State;

#[tauri::command]
pub async fn create_person(
    state: tauri::State<'_, State>,
    entry: EntryCreateSchema<PersonSchema>,
) -> Result<EntryInfoResponseSchema, ApiError> {
    let state = state.lock().await;
    person_service::create(utils::get_database(&state)?, entry).await
}

#[tauri::command]
pub async fn update_person(
    state: tauri::State<'_, State>,
    entry: EntryUpdateSchema<PersonSchema>,
) -> Result<(), ApiError> {
    let state = state.lock().await;
    person_service::update(utils::get_database(&state)?, entry).await
}

#[tauri::command]
pub async fn get_person(
    state: tauri::State<'_, State>,
    id: i32,
) -> Result<GenericEntryPropertyResponseSchema<PersonSchema>, ApiError> {
    let state = state.lock().await;
    person_service::get(utils::get_database(&state)?, id).await
}

#[tauri::command]
pub async fn delete_person(state: tauri::State<'_, State>, id: i32) -> Result<(), ApiError> {
    let state = state.lock().await;
    person_service::delete(utils::get_database(&state)?, id).await
}
