use crate::app::AppState;
use crate::schema::article::ArticleSchema;
use crate::schema::language::{IdentifiedLanguageSchema, LanguageDataSchema};
use crate::services::language_service;
use crate::errors::ApiError;

#[tauri::command]
pub async fn create_language(
    state: tauri::State<'_, AppState>, language: LanguageDataSchema
) -> Result<ArticleSchema<IdentifiedLanguageSchema>, ApiError> {
    language_service::create(&state.database, language).await
}

#[tauri::command]
pub async fn update_language(
    state: tauri::State<'_, AppState>,
    article: ArticleSchema<LanguageDataSchema>
) -> Result<ArticleSchema<IdentifiedLanguageSchema>, ApiError> {
    language_service::update(&state.database, article).await
}

#[tauri::command]
pub async fn get_language(
    state: tauri::State<'_, AppState>, id: i32
) -> Result<ArticleSchema<IdentifiedLanguageSchema>, ApiError> {
    language_service::get(&state.database, id).await
}

#[tauri::command]
pub async fn delete_language(state: tauri::State<'_, AppState>, id: i32) -> Result<(), ApiError> {
    language_service::delete(&state.database, id).await
}