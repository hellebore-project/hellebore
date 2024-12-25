use crate::errors::ApiError;
use crate::schema::{
    article::{ArticleCreateSchema, ArticleResponseSchema, ArticleUpdateSchema},
    language::LanguageDataSchema,
    response::ResponseSchema,
};
use crate::services::language_service;
use crate::state::State;

#[tauri::command]
pub async fn create_language(
    state: tauri::State<'_, State>,
    article: ArticleCreateSchema<LanguageDataSchema>,
) -> Result<ArticleResponseSchema<LanguageDataSchema>, ApiError> {
    let state = state.get_data().await;
    language_service::create(&state.database, article).await
}

#[tauri::command]
pub async fn update_language(
    state: tauri::State<'_, State>,
    article: ArticleUpdateSchema<LanguageDataSchema>,
) -> Result<ResponseSchema<()>, ApiError> {
    let state = state.get_data().await;
    language_service::update(&state.database, article).await
}

#[tauri::command]
pub async fn get_language(
    state: tauri::State<'_, State>,
    id: i32,
) -> Result<ArticleResponseSchema<LanguageDataSchema>, ApiError> {
    let state = state.get_data().await;
    language_service::get(&state.database, id).await
}

#[tauri::command]
pub async fn delete_language(state: tauri::State<'_, State>, id: i32) -> Result<(), ApiError> {
    let state = state.get_data().await;
    language_service::delete(&state.database, id).await
}
