use futures::future;
use sea_orm::{ConnectionTrait, DatabaseConnection};

use ::entity::entry::Model as EntryModel;

use crate::database::{entry_manager, file_manager, transaction_manager};
use crate::model::errors::api_error::ApiError;
use crate::schema::{
    common::DiagnosticResponseSchema,
    entry::{
        EntryArticleResponseSchema, EntryCreateSchema, EntryInfoResponseSchema, EntryProperties,
        EntryPropertyResponseSchema, EntryUpdateResponseSchema, EntryUpdateSchema,
    },
};
use crate::services::{language_service, person_service, word_service};
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

    let entry = _create(
        &txn,
        entity_type,
        folder_id,
        title.to_owned(),
        "".to_owned(),
    )
    .await?;

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
    .map_err(|e| ApiError::not_created("Entry record not created", ENTRY).from_error(e))?;

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
    mut entry: EntryUpdateSchema,
) -> DiagnosticResponseSchema<EntryUpdateResponseSchema> {
    let mut response = EntryUpdateResponseSchema::new(&entry);
    let mut errors: Vec<ApiError> = Vec::new();

    if !entry.has_update() {
        // if the request payload is empty, then this is a no-op;
        // this also applies when the entry doesn't exist in the DB
        response.set_updated(false);
        return DiagnosticResponseSchema {
            data: response,
            errors,
        };
    }

    // Check whether the updated title is unique; if not, then don't update the title
    if let Some(title_value) = entry.title.clone() {
        let is_unique_result =
            entry_manager::is_title_unique_for_id(database, Some(entry.id), &title_value)
                .await
                .map_err(|e| ApiError::db("Entry title is not unique", e));

        match is_unique_result {
            Ok(is_unique) => {
                if !is_unique {
                    response.title.is_unique = false;
                    entry.title = None;
                    errors.push(ApiError::field_not_unique(
                        "Entry title must be globally unique",
                        ENTRY,
                        Some(entry.id),
                        "title".to_owned(),
                        title_value,
                    ));
                }
            }
            Err(e) => {
                entry.title = None;
                errors.push(e);
            }
        }

        if entry.title.is_none() {
            response.title.updated = false;
            errors.push(ApiError::field_not_updated(
                "Unable to update the title.",
                ENTRY,
                "title".to_owned(),
            ));
        }
    }

    _update(database, entry, &mut response, &mut errors).await;

    DiagnosticResponseSchema {
        data: response,
        errors,
    }
}

async fn _update(
    database: &DatabaseConnection,
    entry: EntryUpdateSchema,
    response: &mut EntryUpdateResponseSchema,
    errors: &mut Vec<ApiError>,
) {
    let update_result =
        entry_manager::update(database, entry.id, entry.folder_id, entry.title, entry.text)
            .await
            .map(|_| ())
            .map_err(|e| ApiError::not_updated("Entry record not updated", ENTRY).from_error(e));

    if let Err(e) = update_result {
        response.folder_id.updated = false;
        response.title.updated = false;
        response.text.updated = false;
        errors.push(e);
    }

    if let Some(property_values) = entry.properties {
        let update_prop_result = _update_properties(database, entry.id, &property_values).await;

        if let Err(e) = update_prop_result {
            response.properties.updated = false;
            errors.push(e);
        }
    }

    if let Some(word_values) = entry.words {
        let upsert_word_results = word_service::bulk_upsert(database, word_values).await;

        match upsert_word_results {
            Ok(upsert_word_responses) => {
                for upsert_word_response in upsert_word_responses.into_iter() {
                    response.words.push(upsert_word_response.data);
                    errors.extend(upsert_word_response.errors);
                }
            }
            Err(e) => {
                errors.push(e);
            }
        }
    }
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
) -> Vec<DiagnosticResponseSchema<EntryUpdateResponseSchema>> {
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
) -> Result<DiagnosticResponseSchema<bool>, ApiError> {
    let mut errors: Vec<ApiError> = Vec::new();

    let is_unique = entry_manager::is_title_unique_for_id(database, id, title)
        .await
        .map_err(|e| {
            ApiError::db(
                "Failed to query the entry table while checking whether the title is unique",
                e,
            )
        })?;

    if !is_unique {
        errors.push(ApiError::field_not_unique(
            "Entry title must be globally unique",
            ENTRY,
            id,
            "title".to_owned(),
            title,
        ));
    }

    Ok(DiagnosticResponseSchema {
        data: is_unique,
        errors,
    })
}

pub async fn get_info(
    database: &DatabaseConnection,
    id: i32,
) -> Result<EntryInfoResponseSchema, ApiError> {
    let info = entry_manager::get_info(database, id).await.map_err(|err| {
        ApiError::db(
            "Failed to query entry table while fetching an entry by id",
            err,
        )
    })?;

    match info {
        Some(info) => Ok(generate_info_response(&info)),
        None => return Err(ApiError::not_found("Entry not found", ENTRY)),
    }
}

pub async fn get_properties(
    database: &DatabaseConnection,
    id: i32,
) -> Result<EntryPropertyResponseSchema, ApiError> {
    let info = entry_manager::get_info(database, id).await.map_err(|err| {
        ApiError::db(
            "Failed to query entry table while fetching an entry by id",
            err,
        )
    })?;

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
        _ => Err(ApiError::internal(&format!(
            "Entries of type {} are not supported",
            entity_type
        ))),
    }
}

pub async fn get_text(
    database: &DatabaseConnection,
    id: i32,
) -> Result<EntryArticleResponseSchema, ApiError> {
    let entry = entry_manager::get(database, id).await.map_err(|e| {
        ApiError::db(
            "Failed to query entry table while fetching an entry by id",
            e,
        )
    })?;

    match entry {
        Some(entry) => Ok(generate_article_response(&entry)),
        None => return Err(ApiError::not_found("Entry not found", ENTRY)),
    }
}

pub async fn get_all(
    database: &DatabaseConnection,
) -> Result<Vec<EntryInfoResponseSchema>, ApiError> {
    let entries = entry_manager::get_all(database)
        .await
        .map_err(|e| ApiError::db("Failed to query entry table while fetching all entries", e))?;
    let entries = entries.iter().map(generate_info_response).collect();

    Ok(entries)
}

pub async fn search(
    database: &DatabaseConnection,
    keyword: &str,
) -> Result<Vec<EntryInfoResponseSchema>, ApiError> {
    let entries = entry_manager::search(database, keyword)
        .await
        .map_err(|e| {
            ApiError::db(
                "Failed to query the entry table while searching for entries",
                e,
            )
        })?;
    let entries = entries.iter().map(generate_info_response).collect();

    Ok(entries)
}

pub async fn delete(database: &DatabaseConnection, id: i32) -> Result<(), ApiError> {
    entry_manager::delete(database, id).await.map_err(|e| {
        ApiError::not_deleted("Failed to delete an entry record", ENTRY).from_error(e)
    })?;
    Ok(())
}

pub async fn delete_many(database: &DatabaseConnection, ids: Vec<i32>) -> Result<(), ApiError> {
    entry_manager::delete_many(database, ids)
        .await
        .map(|_| ())
        .map_err(|e| {
            ApiError::not_deleted("Failed to bulk delete one or more entry records", ENTRY)
                .from_error(e)
        })
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

pub fn generate_article_response(entry: &EntryModel) -> EntryArticleResponseSchema {
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
