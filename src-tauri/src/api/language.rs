use crate::app::AppState;
use crate::errors::ApiError;
use crate::schema::{
    article::{ArticleCreateSchema, ArticleResponseSchema, ArticleUpdateSchema},
    language::LanguageDataSchema,
    update::UpdateResponseSchema,
};
use crate::services::language_service;

#[tauri::command]
pub async fn create_language(
    state: tauri::State<'_, AppState>,
    article: ArticleCreateSchema<LanguageDataSchema>,
) -> Result<ArticleResponseSchema<LanguageDataSchema>, ApiError> {
    language_service::create(&state.database, article).await
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
) -> Result<ArticleResponseSchema<LanguageDataSchema>, ApiError> {
    language_service::get(&state.database, id).await
}

#[tauri::command]
pub async fn delete_language(state: tauri::State<'_, AppState>, id: i32) -> Result<(), ApiError> {
    language_service::delete(&state.database, id).await
}
