use crate::app::AppState;
use crate::errors::ApiError;
use crate::schema::{article::ArticleInfoSchema, response::ResponseSchema};
use crate::services::article_service;

#[tauri::command]
pub async fn validate_article_title(
    state: tauri::State<'_, AppState>,
    id: Option<i32>,
    title: &str,
) -> Result<ResponseSchema<bool>, ApiError> {
    article_service::validate_title(&state.database, id, title).await
}

#[tauri::command]
pub async fn get_articles(
    state: tauri::State<'_, AppState>,
) -> Result<Vec<ArticleInfoSchema>, ApiError> {
    article_service::get_all(&state.database).await
}
