use sea_orm::DatabaseConnection;

use ::entity::entry::Model as EntryModel;

use crate::database::{entry_manager, file_manager, transaction_manager};
use crate::errors::ApiError;
use crate::schema::entry::{
    EntryArticleResponseSchema, EntryProperties, EntryPropertyResponseSchema,
};
use crate::schema::{diagnostic::ResponseDiagnosticsSchema, entry::EntryInfoResponseSchema};
use crate::services::{language_service, person_service};
use crate::types::entity::{ENTRY, EntityType};

// NOTE: this currently isn't being used in production,
// though we'll probably need this to create generic entries
pub async fn create(
    database: &DatabaseConnection,
    entity_type: EntityType,
    folder_id: i32,
    title: String,
    text: String,
) -> Result<EntryModel, ApiError> {
    let txn = transaction_manager::begin(database).await?;

    let entry = entry_manager::insert(
        &txn,
        entity_type,
        folder_id,
        title.to_owned(),
        text.to_owned(),
    )
    .await
    .map_err(|e| ApiError::not_inserted(e, ENTRY))?;

    transaction_manager::end(txn).await?;
    Ok(entry)
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

pub async fn get_info(
    database: &DatabaseConnection,
    id: i32,
) -> Result<EntryInfoResponseSchema, ApiError> {
    let info = entry_manager::get_info(database, id)
        .await
        .map_err(|err| ApiError::not_found(err, ENTRY))?;
    return match info {
        Some(info) => Ok(generate_info_response(&info)),
        None => return Err(ApiError::not_found("Entry not found.", ENTRY)),
    };
}

pub async fn get_properties(
    database: &DatabaseConnection,
    id: i32,
) -> Result<EntryPropertyResponseSchema, ApiError> {
    let info = entry_manager::get_info(database, id)
        .await
        .map_err(|err| ApiError::not_found(err, ENTRY))?;

    if info.is_none() {
        return Err(ApiError::not_found("Entry not found", ENTRY));
    }
    let info = info.unwrap();

    let properties = _get_properties(database, id, info.entity_type.into()).await?;

    Ok(generate_property_response(&info, properties))
}

async fn _get_properties(
    database: &DatabaseConnection,
    id: i32,
    entity_type: EntityType,
) -> Result<EntryProperties, ApiError> {
    match entity_type {
        EntityType::Language => Ok(EntryProperties::Language(language_service::get().await?)),
        EntityType::Person => Ok(EntryProperties::Person(
            person_service::get(database, id).await?,
        )),
        _ => Err(ApiError::not_found("Entry properties not found.", ENTRY)),
    }
}

pub async fn get_text(
    database: &DatabaseConnection,
    id: i32,
) -> Result<EntryArticleResponseSchema, ApiError> {
    let entry = entry_manager::get(database, id)
        .await
        .map_err(|e| ApiError::not_found(e, ENTRY))?;
    return match entry {
        Some(entry) => Ok(generate_article_response(&entry)),
        None => return Err(ApiError::not_found("Entry not found.", ENTRY)),
    };
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
    entry_manager::delete(database, id)
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
    EntryInfoResponseSchema {
        id: info.id,
        folder_id: file_manager::convert_null_folder_id_to_root(info.folder_id),
        title: info.title.to_string(),
        entity_type: EntityType::from(info.entity_type),
    }
}

pub fn generate_info_response(info: &entry_manager::EntityInfo) -> EntryInfoResponseSchema {
    EntryInfoResponseSchema {
        id: info.id,
        folder_id: file_manager::convert_null_folder_id_to_root(info.folder_id),
        title: info.title.to_owned(),
        entity_type: EntityType::from(info.entity_type),
    }
}

pub fn generate_property_response(
    info: &entry_manager::EntityInfo,
    properties: EntryProperties,
) -> EntryPropertyResponseSchema {
    EntryPropertyResponseSchema {
        info: generate_info_response(info),
        properties,
    }
}

pub fn generate_article_response(entry: &entity::entry::Model) -> EntryArticleResponseSchema {
    EntryArticleResponseSchema {
        info: EntryInfoResponseSchema {
            id: entry.id,
            folder_id: file_manager::convert_null_folder_id_to_root(entry.folder_id),
            title: entry.title.to_owned(),
            entity_type: EntityType::from(entry.entity_type),
        },
        text: entry.text.to_owned(),
    }
}
