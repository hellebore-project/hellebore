use crate::app::AppState;
use crate::errors::ApiError;
use crate::schema::{
    article::{ArticleCreateSchema, ArticleResponseSchema, ArticleUpdateSchema},
    person::PersonDataSchema,
    response::ResponseSchema,
};
use crate::services::person_service;

#[tauri::command]
pub async fn create_person(
    state: tauri::State<'_, AppState>,
    article: ArticleCreateSchema<PersonDataSchema>,
) -> Result<ArticleResponseSchema<PersonDataSchema>, ApiError> {
    person_service::create(&state.database, article).await
}

#[tauri::command]
pub async fn update_person(
    state: tauri::State<'_, AppState>,
    article: ArticleUpdateSchema<PersonDataSchema>,
) -> Result<ResponseSchema<()>, ApiError> {
    person_service::update(&state.database, article).await
}

#[tauri::command]
pub async fn get_person(
    state: tauri::State<'_, AppState>,
    id: i32,
) -> Result<ArticleResponseSchema<PersonDataSchema>, ApiError> {
    person_service::get(&state.database, id).await
}

#[tauri::command]
pub async fn delete_person(state: tauri::State<'_, AppState>, id: i32) -> Result<(), ApiError> {
    person_service::delete(&state.database, id).await
}
