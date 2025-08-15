use crate::api::utils;
use crate::errors::ApiError;
use crate::schema::{
    entry::{EntryCreateSchema, EntryDataResponseSchema, EntryInfoSchema, EntryUpdateSchema},
    person::PersonDataSchema,
};
use crate::services::person_service;
use crate::state::State;

#[tauri::command]
pub async fn create_person(
    state: tauri::State<'_, State>,
    entity: EntryCreateSchema<PersonDataSchema>,
) -> Result<EntryInfoSchema, ApiError> {
    let state = state.lock().await;
    person_service::create(utils::get_database(&state)?, entity).await
}

#[tauri::command]
pub async fn update_person(
    state: tauri::State<'_, State>,
    entity: EntryUpdateSchema<PersonDataSchema>,
) -> Result<(), ApiError> {
    let state = state.lock().await;
    person_service::update(utils::get_database(&state)?, entity).await
}

#[tauri::command]
pub async fn get_person(
    state: tauri::State<'_, State>,
    id: i32,
) -> Result<EntryDataResponseSchema<PersonDataSchema>, ApiError> {
    let state = state.lock().await;
    person_service::get(utils::get_database(&state)?, id).await
}

#[tauri::command]
pub async fn delete_person(state: tauri::State<'_, State>, id: i32) -> Result<(), ApiError> {
    let state = state.lock().await;
    person_service::delete(utils::get_database(&state)?, id).await
}
