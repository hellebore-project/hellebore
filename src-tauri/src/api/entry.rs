use uuid::Uuid;

use crate::model::{errors::Error, state::State};
use crate::schema::{
    common::{DiagnosticResponseSchema, PaginationRequestSchema, PaginationResponseSchema},
    entry::{
        EntryArticleResponseSchema, EntryCreateSchema, EntryInfoResponseSchema,
        EntryListRequestSchema, EntryPropertyResponseSchema, EntryUpdateResponseSchema,
        EntryUpdateSchema,
    },
};
use crate::services::{entry_service, project_service};

#[tauri::command]
pub async fn create_entry(
    state: tauri::State<'_, State>,
    project_id: Uuid,
    entry: EntryCreateSchema,
) -> Result<EntryInfoResponseSchema, Error> {
    let state = state.lock().await;
    let db = project_service::get_database(&state, project_id)?;
    entry_service::create(db, entry).await
}

#[tauri::command]
pub async fn update_entry(
    state: tauri::State<'_, State>,
    project_id: Uuid,
    entry: EntryUpdateSchema,
) -> Result<DiagnosticResponseSchema<EntryUpdateResponseSchema>, Error> {
    let state = state.lock().await;
    let db = project_service::get_database(&state, project_id)?;
    Ok(entry_service::update(db, entry).await)
}

#[tauri::command]
pub async fn update_entries(
    state: tauri::State<'_, State>,
    project_id: Uuid,
    entries: Vec<EntryUpdateSchema>,
) -> Result<Vec<DiagnosticResponseSchema<EntryUpdateResponseSchema>>, Error> {
    let state = state.lock().await;
    let db = project_service::get_database(&state, project_id)?;
    Ok(entry_service::bulk_update(db, entries).await)
}

#[tauri::command]
pub async fn validate_entry_title(
    state: tauri::State<'_, State>,
    project_id: Uuid,
    id: Option<Uuid>,
    title: &str,
) -> Result<DiagnosticResponseSchema<bool>, Error> {
    let state = state.lock().await;
    let db = project_service::get_database(&state, project_id)?;
    entry_service::validate_title(db, id, title).await
}

#[tauri::command]
pub async fn get_entry(
    state: tauri::State<'_, State>,
    project_id: Uuid,
    id: Uuid,
) -> Result<EntryInfoResponseSchema, Error> {
    let state = state.lock().await;
    let db = project_service::get_database(&state, project_id)?;
    entry_service::get_info(db, id).await
}

#[tauri::command]
pub async fn get_entry_properties(
    state: tauri::State<'_, State>,
    project_id: Uuid,
    id: Uuid,
) -> Result<EntryPropertyResponseSchema, Error> {
    let state = state.lock().await;
    let db = project_service::get_database(&state, project_id)?;
    entry_service::get_properties(db, id).await
}

#[tauri::command]
pub async fn get_entry_text(
    state: tauri::State<'_, State>,
    project_id: Uuid,
    id: Uuid,
) -> Result<DiagnosticResponseSchema<EntryArticleResponseSchema>, Error> {
    let state = state.lock().await;
    let db = project_service::get_database(&state, project_id)?;
    entry_service::get_text(db, id).await
}

#[tauri::command]
pub async fn list_entries(
    state: tauri::State<'_, State>,
    project_id: Uuid,
    args: Option<PaginationRequestSchema<EntryListRequestSchema>>,
) -> Result<PaginationResponseSchema<EntryInfoResponseSchema>, Error> {
    let state = state.lock().await;
    let db = project_service::get_database(&state, project_id)?;
    entry_service::list(db, args).await
}

#[tauri::command]
pub async fn delete_entry(
    state: tauri::State<'_, State>,
    project_id: Uuid,
    id: Uuid,
) -> Result<(), Error> {
    let state = state.lock().await;
    let db = project_service::get_database(&state, project_id)?;
    entry_service::delete(db, id).await
}
