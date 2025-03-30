use crate::api::utils;
use crate::errors::ApiError;
use crate::schema::{
    article::{ArticleCreateSchema, ArticleResponseSchema, ArticleUpdateSchema},
    language::LanguageDataSchema,
    response::ResponseDiagnosticsSchema,
};
use crate::services::language_service;
use crate::state::State;

#[tauri::command]
pub async fn create_language(
    state: tauri::State<'_, State>,
    article: ArticleCreateSchema<LanguageDataSchema>,
) -> Result<ArticleResponseSchema<LanguageDataSchema>, ApiError> {
    let state = state.lock().await;
    language_service::create(utils::get_database(&state)?, article).await
}

#[tauri::command]
pub async fn update_language(
    state: tauri::State<'_, State>,
    article: ArticleUpdateSchema<LanguageDataSchema>,
) -> Result<ResponseDiagnosticsSchema<()>, ApiError> {
    let state = state.lock().await;
    language_service::update(utils::get_database(&state)?, article).await
}

#[tauri::command]
pub async fn get_language(
    state: tauri::State<'_, State>,
    id: i32,
) -> Result<ArticleResponseSchema<LanguageDataSchema>, ApiError> {
    let state = state.lock().await;
    language_service::get(utils::get_database(&state)?, id).await
}

#[tauri::command]
pub async fn delete_language(state: tauri::State<'_, State>, id: i32) -> Result<(), ApiError> {
    let state = state.lock().await;
    language_service::delete(utils::get_database(&state)?, id).await
}
