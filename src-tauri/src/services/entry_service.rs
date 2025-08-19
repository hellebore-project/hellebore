use sea_orm::DatabaseConnection;

use ::entity::entry::Model as EntryModel;

use crate::database::entry_manager;
use crate::database::folder_manager::convert_null_folder_id_to_root;
use crate::errors::ApiError;
use crate::schema::{entry::EntryInfoResponseSchema, response::ResponseDiagnosticsSchema};
use crate::types::{ENTRY, EntityType};

pub async fn create(
    database: &DatabaseConnection,
    entity_type: EntityType,
    folder_id: i32,
    title: String,
) -> Result<EntryModel, ApiError> {
    entry_manager::insert(
        &database,
        folder_id,
        title.to_owned(),
        entity_type,
        "".to_owned(),
    )
    .await
    .map_err(|e| ApiError::not_inserted(e, ENTRY))
}

pub async fn update_title(
    database: &DatabaseConnection,
    id: i32,
    title: String,
) -> Result<(), ApiError> {
    // Check whether the updated title is unique; if not, then abort the update
    let _title = title.clone();
    let is_unique = entry_manager::is_title_unique_for_id(database, Some(id), &title)
        .await
        .map_err(|e| ApiError::query_failed(e, ENTRY))?;

    if !is_unique {
        return Err(ApiError::field_not_unique(
            ENTRY,
            Some(id),
            "title".to_owned(),
            _title,
        ));
    }

    return entry_manager::update_title(database, id, title)
        .await
        .map(|_| ())
        .map_err(|e| ApiError::field_not_updated(e, ENTRY, "title".to_owned()));
}

pub async fn update_folder(
    database: &DatabaseConnection,
    id: i32,
    folder_id: i32,
) -> Result<(), ApiError> {
    return entry_manager::update_folder(database, id, folder_id)
        .await
        .map(|_| ())
        .map_err(|e| ApiError::field_not_updated(e, ENTRY, "folder_id".to_owned()));
}

pub async fn update_text(
    database: &DatabaseConnection,
    id: i32,
    text: String,
) -> Result<(), ApiError> {
    return entry_manager::update_text(database, id, text)
        .await
        .map(|_| ())
        .map_err(|e| ApiError::field_not_updated(e, ENTRY, "text".to_owned()));
}

pub async fn validate_title(
    database: &DatabaseConnection,
    id: Option<i32>,
    title: &str,
) -> Result<ResponseDiagnosticsSchema<bool>, ApiError> {
    let mut errors: Vec<ApiError> = Vec::new();
    let is_unique = entry_manager::is_title_unique_for_id(database, id, title)
        .await
        .map_err(|e| ApiError::query_failed(e, ENTRY))?;
    if !is_unique {
        errors.push(ApiError::field_not_unique(
            ENTRY,
            id,
            "title".to_owned(),
            title,
        ));
    }
    return Ok(ResponseDiagnosticsSchema {
        data: is_unique,
        errors,
    });
}

pub async fn get(database: &DatabaseConnection, id: i32) -> Result<EntryModel, ApiError> {
    let entry = entry_manager::get(database, id)
        .await
        .map_err(|e| ApiError::not_found(e, ENTRY))?;
    return match entry {
        Some(a) => Ok(a),
        None => return Err(ApiError::not_found("Entry not found.", ENTRY)),
    };
}

pub async fn get_text(database: &DatabaseConnection, id: i32) -> Result<Option<String>, ApiError> {
    let text = entry_manager::get_text(database, id)
        .await
        .map_err(|e| ApiError::not_found(e, ENTRY))?;
    Ok(text)
}

pub async fn get_all(
    database: &DatabaseConnection,
) -> Result<Vec<EntryInfoResponseSchema>, ApiError> {
    let entries = entry_manager::get_all(database)
        .await
        .map_err(|e| ApiError::not_found(e, ENTRY))?;
    let entries = entries.iter().map(generate_info_response).collect();
    return Ok(entries);
}

pub async fn delete(database: &DatabaseConnection, id: i32) -> Result<(), ApiError> {
    entry_manager::delete(&database, id)
        .await
        .map_err(|e| ApiError::not_deleted(e, ENTRY))?;
    return Ok(());
}

pub async fn delete_many(database: &DatabaseConnection, ids: Vec<i32>) -> Result<(), ApiError> {
    entry_manager::delete_many(database, ids)
        .await
        .map(|_| ())
        .map_err(|e| ApiError::not_deleted(e, ENTRY))
}

pub fn generate_insert_response(info: &EntryModel) -> EntryInfoResponseSchema {
    return EntryInfoResponseSchema {
        id: info.id,
        folder_id: convert_null_folder_id_to_root(info.folder_id),
        title: info.title.to_string(),
        entity_type: EntityType::from(info.entity_type),
    };
}

pub fn generate_info_response(info: &entry_manager::EntityInfo) -> EntryInfoResponseSchema {
    return EntryInfoResponseSchema {
        id: info.id,
        folder_id: convert_null_folder_id_to_root(info.folder_id),
        title: info.title.to_string(),
        entity_type: EntityType::from(info.entity_type),
    };
}
