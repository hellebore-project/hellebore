use crate::api::utils;
use crate::errors::ApiError;
use crate::schema::{
    article::{ArticleCreateSchema, ArticleInfoSchema},
    entity::{EntityResponseSchema, EntityUpdateSchema},
    person::PersonDataSchema,
};
use crate::services::person_service;
use crate::state::State;

#[tauri::command]
pub async fn create_person(
    state: tauri::State<'_, State>,
    article: ArticleCreateSchema<PersonDataSchema>,
) -> Result<ArticleInfoSchema, ApiError> {
    let state = state.lock().await;
    person_service::create(utils::get_database(&state)?, article).await
}

#[tauri::command]
pub async fn update_person(
    state: tauri::State<'_, State>,
    entity: EntityUpdateSchema<PersonDataSchema>,
) -> Result<(), ApiError> {
    let state = state.lock().await;
    person_service::update(utils::get_database(&state)?, entity).await
}

#[tauri::command]
pub async fn get_person(
    state: tauri::State<'_, State>,
    id: i32,
) -> Result<EntityResponseSchema<PersonDataSchema>, ApiError> {
    let state = state.lock().await;
    person_service::get(utils::get_database(&state)?, id).await
}

#[tauri::command]
pub async fn delete_person(state: tauri::State<'_, State>, id: i32) -> Result<(), ApiError> {
    let state = state.lock().await;
    person_service::delete(utils::get_database(&state)?, id).await
}
