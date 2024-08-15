use crate::app::AppState;
use crate::schema::article::ArticleInfoSchema;
use crate::services::article_service;
use crate::errors::ApiError;

#[tauri::command]
pub async fn get_articles(
    state: tauri::State<'_, AppState>
) -> Result<Vec<ArticleInfoSchema>, ApiError> {
    article_service::get_all(&state.database).await
}