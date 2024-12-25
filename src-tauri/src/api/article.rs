use crate::errors::ApiError;
use crate::schema::{article::ArticleInfoSchema, response::ResponseSchema};
use crate::services::article_service;
use crate::state::State;

#[tauri::command]
pub async fn validate_article_title(
    state: tauri::State<'_, State>,
    id: Option<i32>,
    title: &str,
) -> Result<ResponseSchema<bool>, ApiError> {
    let state = state.get_data().await;
    article_service::validate_title(&state.database, id, title).await
}

#[tauri::command]
pub async fn get_articles(
    state: tauri::State<'_, State>,
) -> Result<Vec<ArticleInfoSchema>, ApiError> {
    let state = state.get_data().await;
    article_service::get_all(&state.database).await
}
