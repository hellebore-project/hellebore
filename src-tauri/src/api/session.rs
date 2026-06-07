use crate::api::utils;
use crate::model::errors::error::Error;
use crate::schema::session::SessionResponseSchema;
use crate::services::session_service;
use crate::state::State;

#[tauri::command]
pub async fn get_session(state: tauri::State<'_, State>) -> Result<SessionResponseSchema, Error> {
    let state = state.lock().await;
    let db = match utils::get_database(&state) {
        Ok(db) => Some(db),
        Err(_) => None,
    };
    session_service::get(db, &state.settings).await
}
