use crate::app::AppState;
use crate::errors::ApiError;
use crate::schema::{
    article::{ArticleResponseSchema, ArticleUpdateSchema},
    language::{IdentifiedLanguageSchema, LanguageDataSchema},
    update::UpdateResponseSchema,
};
use crate::services::language_service;

#[tauri::command]
pub async fn create_language(
    state: tauri::State<'_, AppState>,
    data: LanguageDataSchema,
) -> Result<ArticleResponseSchema<IdentifiedLanguageSchema>, ApiError> {
    language_service::create(&state.database, data).await
}

#[tauri::command]
pub async fn update_language(
    state: tauri::State<'_, AppState>,
    article: ArticleUpdateSchema<LanguageDataSchema>,
) -> Result<UpdateResponseSchema<()>, ApiError> {
    language_service::update(&state.database, article).await
}

#[tauri::command]
pub async fn get_language(
    state: tauri::State<'_, AppState>,
    id: i32,
) -> Result<ArticleResponseSchema<IdentifiedLanguageSchema>, ApiError> {
    language_service::get(&state.database, id).await
}

#[tauri::command]
pub async fn delete_language(state: tauri::State<'_, AppState>, id: i32) -> Result<(), ApiError> {
    language_service::delete(&state.database, id).await
}
