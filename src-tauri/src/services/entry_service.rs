use futures::future;

use sea_orm::{ConnectionTrait, DatabaseConnection};

use ::entity::entry::Model as EntryModel;

use crate::database::{entry_manager, file_manager, transaction_manager};
use crate::errors::ApiError;
use crate::schema::entry::{
    EntryArticleResponseSchema, EntryCreateSchema, EntryProperties, EntryPropertyResponseSchema,
    EntryUpdateSchema,
};
use crate::schema::{diagnostic::ResponseDiagnosticsSchema, entry::EntryInfoResponseSchema};
use crate::services::{language_service, person_service};
use crate::types::entity::{ENTRY, EntityType};

pub async fn create(
    database: &DatabaseConnection,
    entry: EntryCreateSchema,
) -> Result<EntryInfoResponseSchema, ApiError> {
    let entity_type = entry.entity_type;
    let folder_id = entry.folder_id;
    let title = entry.title;
    let properties = entry.properties;

    let txn = transaction_manager::begin(database).await?;

    let entry = entry_manager::insert(
        &txn,
        entity_type,
        folder_id,
        title.to_owned(),
        "".to_owned(),
    )
    .await
    .map_err(|e| ApiError::not_inserted(e, ENTRY))?;

    _create_properties(&txn, entry.id, &properties).await?;

    transaction_manager::end(txn).await?;

    Ok(generate_insert_response(&entry))
}

pub async fn _create<C>(
    con: &C,
    entity_type: EntityType,
    folder_id: i32,
    title: String,
    text: String,
) -> Result<EntryModel, ApiError>
where
    C: ConnectionTrait,
{
    let entry = entry_manager::insert(
        con,
        entity_type,
        folder_id,
        title.to_owned(),
        text.to_owned(),
    )
    .await
    .map_err(|e| ApiError::not_inserted(e, ENTRY))?;

    Ok(entry)
}

async fn _create_properties<C>(
    con: &C,
    id: i32,
    properties: &EntryProperties,
) -> Result<(), ApiError>
where
    C: ConnectionTrait,
{
    match properties {
        EntryProperties::Language(_) => Ok(language_service::create(con, id).await?),
        EntryProperties::Person(props) => Ok(person_service::create(con, id, props).await?),
    }
}

pub async fn update(
    database: &DatabaseConnection,
    entry: EntryUpdateSchema,
) -> ResponseDiagnosticsSchema<i32> {
    let id = entry.id;
    let folder_id = entry.folder_id;
    let mut title = entry.title;
    let properties = entry.properties;
    let text = entry.text;

    let mut errors: Vec<ApiError> = Vec::new();

    // Check whether the updated title is unique; if not, then don't update the title
    if let Some(title_value) = title.clone() {
        let is_unique_result =
            entry_manager::is_title_unique_for_id(database, Some(id), &title_value)
                .await
                .map_err(|e| ApiError::query_failed(e, ENTRY));

        match is_unique_result {
            Ok(is_unique) => {
                if !is_unique {
                    title = None;
                    errors.push(ApiError::field_not_unique(
                        ENTRY,
                        Some(id),
                        "title".to_owned(),
                        title_value,
                    ));
                }
            }
            Err(e) => {
                title = None;
                errors.push(e);
            }
        }

        if title.is_none() {
            errors.push(ApiError::field_not_updated(
                "Unable to update the title.",
                ENTRY,
                "title".to_owned(),
            ));
        }
    }

    let txn_result = transaction_manager::begin(database).await;

    if let Ok(txn) = txn_result {
        let update_result = entry_manager::update(&txn, id, folder_id, title, text)
            .await
            .map(|_| ())
            .map_err(|e| ApiError::not_updated(e, ENTRY));
        if let Err(e) = update_result {
            errors.push(e);
        }

        if let Some(property_values) = properties {
            let update_prop_result = _update_properties(&txn, id, &property_values).await;
            if let Err(e) = update_prop_result {
                errors.push(e);
            }
        }

        let txn_result = transaction_manager::end(txn).await;
        if let Err(e) = txn_result {
            errors.push(e);
        }
    } else if let Err(e) = txn_result {
        errors.push(e);
    }

    ResponseDiagnosticsSchema { data: id, errors }
}

async fn _update_properties<C>(
    con: &C,
    id: i32,
    properties: &EntryProperties,
) -> Result<(), ApiError>
where
    C: ConnectionTrait,
{
    match properties {
        EntryProperties::Language(_) => Ok(()),
        EntryProperties::Person(props) => Ok(person_service::update(con, id, props).await?),
    }
}

pub async fn bulk_update(
    database: &DatabaseConnection,
    entries: Vec<EntryUpdateSchema>,
) -> Vec<ResponseDiagnosticsSchema<i32>> {
    future::join_all(
        entries
            .into_iter()
            .map(async |entry| update(database, entry).await),
    )
    .await
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
        .map_err(|e| ApiError::query_failed(e, ENTRY))?;
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
        .map_err(|e| ApiError::query_failed(e, ENTRY))?;
    let entries = entries.iter().map(generate_info_response).collect();
    return Ok(entries);
}

pub async fn search(
    database: &DatabaseConnection,
    keyword: &str,
) -> Result<Vec<EntryInfoResponseSchema>, ApiError> {
    let entries = entry_manager::search(database, keyword)
        .await
        .map_err(|e| ApiError::query_failed(e, ENTRY))?;
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
