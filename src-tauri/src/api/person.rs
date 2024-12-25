use crate::errors::ApiError;
use crate::schema::{
    article::{ArticleCreateSchema, ArticleResponseSchema, ArticleUpdateSchema},
    person::PersonDataSchema,
    response::ResponseSchema,
};
use crate::services::person_service;
use crate::state::State;

#[tauri::command]
pub async fn create_person(
    state: tauri::State<'_, State>,
    article: ArticleCreateSchema<PersonDataSchema>,
) -> Result<ArticleResponseSchema<PersonDataSchema>, ApiError> {
    let state = state.get_data().await;
    person_service::create(&state.database, article).await
}

#[tauri::command]
pub async fn update_person(
    state: tauri::State<'_, State>,
    article: ArticleUpdateSchema<PersonDataSchema>,
) -> Result<ResponseSchema<()>, ApiError> {
    let state = state.get_data().await;
    person_service::update(&state.database, article).await
}

#[tauri::command]
pub async fn get_person(
    state: tauri::State<'_, State>,
    id: i32,
) -> Result<ArticleResponseSchema<PersonDataSchema>, ApiError> {
    let state = state.get_data().await;
    person_service::get(&state.database, id).await
}

#[tauri::command]
pub async fn delete_person(state: tauri::State<'_, State>, id: i32) -> Result<(), ApiError> {
    let state = state.get_data().await;
    person_service::delete(&state.database, id).await
}
