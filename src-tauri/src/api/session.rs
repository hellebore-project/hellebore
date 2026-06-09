use crate::api::utils;
use crate::model::{errors::Error, state::State};
use crate::schema::session::SessionResponseSchema;
use crate::services::session_service;

#[tauri::command]
pub async fn get_session(state: tauri::State<'_, State>) -> Result<SessionResponseSchema, Error> {
    let state = state.lock().await;
    let db = utils::get_database(&state).ok();
    session_service::get(db, &state.config).await
}
