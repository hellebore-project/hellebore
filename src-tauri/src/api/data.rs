use crate::api::utils;
use crate::errors::ApiError;
use crate::schema::data::BulkDataSchema;
use crate::services::data_service;
use crate::state::State;

#[tauri::command]
pub async fn delete_bulk_data(
    state: tauri::State<'_, State>,
    data: BulkDataSchema,
) -> Result<(), ApiError> {
    let state = state.lock().await;
    data_service::bulk_delete(utils::get_database(&state)?, data).await
}
