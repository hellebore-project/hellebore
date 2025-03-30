use crate::api::utils;
use crate::errors::ApiError;
use crate::schema::{article::ArticleInfoSchema, response::ResponseDiagnosticsSchema};
use crate::services::article_service;
use crate::state::State;

#[tauri::command]
pub async fn validate_article_title(
    state: tauri::State<'_, State>,
    id: Option<i32>,
    title: &str,
) -> Result<ResponseDiagnosticsSchema<bool>, ApiError> {
    let state = state.lock().await;
    article_service::validate_title(utils::get_database(&state)?, id, title).await
}

#[tauri::command]
pub async fn get_articles(
    state: tauri::State<'_, State>,
) -> Result<Vec<ArticleInfoSchema>, ApiError> {
    let state = state.lock().await;
    article_service::get_all(utils::get_database(&state)?).await
}
