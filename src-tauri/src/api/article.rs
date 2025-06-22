use crate::api::utils;
use crate::errors::ApiError;
use crate::schema::{
    article::{ArticleInfoSchema, ArticleResponseSchema},
    response::ResponseDiagnosticsSchema,
};
use crate::services::article_service;
use crate::state::State;

#[tauri::command]
pub async fn update_article_title(
    state: tauri::State<'_, State>,
    id: i32,
    title: String,
) -> Result<(), ApiError> {
    let state = state.lock().await;
    article_service::update_title(utils::get_database(&state)?, id, title).await
}

#[tauri::command]
pub async fn update_article_folder(
    state: tauri::State<'_, State>,
    id: i32,
    folder_id: i32,
) -> Result<(), ApiError> {
    let state = state.lock().await;
    article_service::update_folder(utils::get_database(&state)?, id, folder_id).await
}

#[tauri::command]
pub async fn update_article_text(
    state: tauri::State<'_, State>,
    id: i32,
    text: String,
) -> Result<(), ApiError> {
    let state = state.lock().await;
    article_service::update_text(utils::get_database(&state)?, id, text).await
}

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
pub async fn get_article_text(
    state: tauri::State<'_, State>,
    id: i32,
) -> Result<ArticleResponseSchema, ApiError> {
    let state = state.lock().await;
    article_service::get_text(utils::get_database(&state)?, id).await
}

#[tauri::command]
pub async fn get_articles(
    state: tauri::State<'_, State>,
) -> Result<Vec<ArticleInfoSchema>, ApiError> {
    let state = state.lock().await;
    article_service::get_all(utils::get_database(&state)?).await
}
