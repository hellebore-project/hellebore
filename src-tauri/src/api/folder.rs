use uuid::Uuid;

use crate::model::{errors::Error, state::State};
use crate::schema::{
    common::DiagnosticResponseSchema,
    file::BulkFileResponseSchema,
    folder::{
        FolderCreateSchema, FolderResponseSchema, FolderUpdateResponseSchema, FolderUpdateSchema,
        FolderValidationSchema,
    },
};
use crate::services::{folder_service, project_service};

#[tauri::command]
pub async fn create_folder(
    state: tauri::State<'_, State>,
    project_id: Uuid,
    info: FolderCreateSchema,
) -> Result<FolderResponseSchema, Error> {
    let state = state.lock().await;
    let db = project_service::get_database(&state, project_id)?;
    folder_service::create(db, info).await
}

#[tauri::command]
pub async fn update_folder(
    state: tauri::State<'_, State>,
    project_id: Uuid,
    folder: FolderUpdateSchema,
) -> Result<DiagnosticResponseSchema<FolderUpdateResponseSchema>, Error> {
    let state = state.lock().await;
    let db = project_service::get_database(&state, project_id)?;
    Ok(folder_service::update(db, folder).await)
}

#[tauri::command]
pub async fn update_folders(
    state: tauri::State<'_, State>,
    project_id: Uuid,
    folders: Vec<FolderUpdateSchema>,
) -> Result<Vec<DiagnosticResponseSchema<FolderUpdateResponseSchema>>, Error> {
    let state = state.lock().await;
    let db = project_service::get_database(&state, project_id)?;
    Ok(folder_service::bulk_update(db, folders).await)
}

#[tauri::command]
pub async fn validate_folder_name(
    state: tauri::State<'_, State>,
    project_id: Uuid,
    id: Option<Uuid>,
    parent_id: Uuid,
    name: &str,
) -> Result<DiagnosticResponseSchema<FolderValidationSchema>, Error> {
    let state = state.lock().await;
    let db = project_service::get_database(&state, project_id)?;
    folder_service::validate_name(db, id, parent_id, name).await
}

#[tauri::command]
pub async fn get_folder(
    state: tauri::State<'_, State>,
    project_id: Uuid,
    id: Uuid,
) -> Result<FolderResponseSchema, Error> {
    let state = state.lock().await;
    let db = project_service::get_database(&state, project_id)?;
    folder_service::get(db, id).await
}

#[tauri::command]
pub async fn get_folders(
    state: tauri::State<'_, State>,
    project_id: Uuid,
) -> Result<Vec<FolderResponseSchema>, Error> {
    let state = state.lock().await;
    let db = project_service::get_database(&state, project_id)?;
    folder_service::get_all(db).await
}

#[tauri::command]
pub async fn delete_folder(
    state: tauri::State<'_, State>,
    project_id: Uuid,
    id: Uuid,
) -> Result<BulkFileResponseSchema, Error> {
    let state = state.lock().await;
    let db = project_service::get_database(&state, project_id)?;
    folder_service::delete(db, id).await
}
