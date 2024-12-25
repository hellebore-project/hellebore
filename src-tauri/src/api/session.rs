use crate::errors::ApiError;
use crate::schema::session::SessionResponseSchema;
use crate::services::session_service;
use crate::state::State;

#[tauri::command]
pub async fn get_session(
    state: tauri::State<'_, State>,
) -> Result<SessionResponseSchema, ApiError> {
    let state = state.get_data().await;
    session_service::get(&state.database, &state.settings).await
}
