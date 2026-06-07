use futures::future;
use sea_orm::{ConnectionTrait, DatabaseConnection};

use ::entity::entry::Model as EntryModel;

use crate::database::{entry_manager, file_manager, transaction_manager};
use crate::model::{
    errors::{Error, ErrorBuilder},
    text::TextNode,
};
use crate::schema::entry::EntrySearchSchema;
use crate::schema::{
    common::DiagnosticResponseSchema,
    entry::{
        EntryArticleResponseSchema, EntryCreateSchema, EntryInfoResponseSchema, EntryProperties,
        EntryPropertyResponseSchema, EntryUpdateResponseSchema, EntryUpdateSchema,
    },
};
use crate::services::{entry_text_service, language_service, person_service, word_service};
use crate::types::entity::{ENTRY, EntityType};

pub async fn create(
    database: &DatabaseConnection,
    entry: EntryCreateSchema,
) -> Result<EntryInfoResponseSchema, Error> {
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
) -> Result<EntryModel, Error>
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
    .map_err(|e| {
        ErrorBuilder::new()
            .msg("Entry record not created.")
            .from_err(e)
            .entity(ENTRY)
            .not_created()
    })?;

    Ok(entry)
}

async fn _create_properties<C>(con: &C, id: i32, properties: &EntryProperties) -> Result<(), Error>
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
    let mut errors: Vec<Error> = Vec::new();

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
                .map_err(|e| {
                    ErrorBuilder::new()
                        .msg("Entry title is not unique.")
                        .from_err(e)
                        .entity(ENTRY)
                        .attribute("title")
                        .not_unique()
                });

        match is_unique_result {
            Ok(is_unique) => {
                if !is_unique {
                    response.title.is_unique = false;
                    entry.title = None;
                    errors.push(
                        ErrorBuilder::new()
                            .msg("Entry title must be globally unique.")
                            .entity(ENTRY)
                            .attribute("title")
                            .with_id(Some(entry.id))
                            .with_value(&title_value)
                            .not_unique(),
                    );
                }
            }
            Err(e) => {
                entry.title = None;
                errors.push(e);
            }
        }

        if entry.title.is_none() {
            response.title.updated = false;
            errors.push(
                ErrorBuilder::new()
                    .msg("Unable to update the title.")
                    .entity(ENTRY)
                    .attribute("title")
                    .with_id(Some(entry.id))
                    .not_updated(),
            );
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
    errors: &mut Vec<Error>,
) {
    let update_result =
        entry_manager::update(database, entry.id, entry.folder_id, entry.title, entry.text)
            .await
            .map(|_| ())
            .map_err(|e| {
                ErrorBuilder::new()
                    .msg("Entry record not updated.")
                    .from_err(e)
                    .entity(ENTRY)
                    .with_id(entry.id)
                    .not_updated()
            });

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

async fn _update_properties<C>(con: &C, id: i32, properties: &EntryProperties) -> Result<(), Error>
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
    // FIXME: `entries` may contain multiple conflicting changes for the same entry;
    // we need to decide how to handle such conflicts
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
) -> Result<DiagnosticResponseSchema<bool>, Error> {
    let mut errors: Vec<Error> = Vec::new();

    let is_unique = entry_manager::is_title_unique_for_id(database, id, title)
        .await
        .map_err(|e| {
            ErrorBuilder::new()
                .msg("Failed to query the entry table while checking whether the title is unique.")
                .from_err(e)
                .db()
                .query_failed()
        })?;

    if !is_unique {
        errors.push(
            ErrorBuilder::new()
                .msg("Entry title must be globally unique.")
                .entity(ENTRY)
                .attribute("title")
                .with_value(&title)
                .not_unique(),
        );
    }

    Ok(DiagnosticResponseSchema {
        data: is_unique,
        errors,
    })
}

pub async fn get_info(
    database: &DatabaseConnection,
    id: i32,
) -> Result<EntryInfoResponseSchema, Error> {
    let info = entry_manager::get_info(database, id).await.map_err(|e| {
        ErrorBuilder::new()
            .msg("Failed to query entry table while fetching an entry by id.")
            .from_err(e)
            .db()
            .query_failed()
    })?;

    match info {
        Some(info) => Ok(generate_info_response(&info)),
        None => Err(ErrorBuilder::new()
            .msg("Entry not found.")
            .entity(ENTRY)
            .with_id(id)
            .not_found()),
    }
}

pub async fn get_properties(
    database: &DatabaseConnection,
    id: i32,
) -> Result<EntryPropertyResponseSchema, Error> {
    let info = entry_manager::get_info(database, id).await.map_err(|e| {
        ErrorBuilder::new()
            .msg("Failed to query entry table while fetching an entry by id.")
            .from_err(e)
            .db()
            .query_failed()
    })?;

    if info.is_none() {
        return Err(ErrorBuilder::new()
            .msg("Entry not found.")
            .entity(ENTRY)
            .with_id(id)
            .not_found());
    }
    let info = info.unwrap();

    let properties = _get_properties(database, id, info.entity_type.into()).await?;

    Ok(generate_property_response(&info, properties))
}

async fn _get_properties(
    database: &DatabaseConnection,
    id: i32,
    entity_type: EntityType,
) -> Result<EntryProperties, Error> {
    match entity_type {
        EntityType::Language => Ok(EntryProperties::Language(language_service::get().await?)),
        EntityType::Person => Ok(EntryProperties::Person(
            person_service::get(database, id).await?,
        )),
        _ => Err(ErrorBuilder::new()
            .msg(&format!(
                "Entries of type {} are not supported.",
                entity_type
            ))
            .entity(entity_type)
            .entry()
            .unsupported_entry_type()),
    }
}

pub async fn get_text(
    database: &DatabaseConnection,
    id: i32,
) -> Result<DiagnosticResponseSchema<EntryArticleResponseSchema>, Error> {
    let entry = entry_manager::get(database, id).await.map_err(|e| {
        ErrorBuilder::new()
            .msg("Failed to query entry table while fetching an entry by id.")
            .from_err(e)
            .db()
            .query_failed()
    })?;

    let entry = match entry {
        Some(entry) => entry,
        None => {
            return Err(ErrorBuilder::new()
                .msg("Entry not found.")
                .entity(ENTRY)
                .with_id(id)
                .not_found());
        }
    };

    let mut errors: Vec<Error> = Vec::new();
    let text = entry_text_service::sync_text(database, id, &entry.text, &mut errors).await;

    let text_response = generate_text_response(entry, text);
    let diagnostic_response = DiagnosticResponseSchema {
        data: text_response,
        errors,
    };

    Ok(diagnostic_response)
}

pub async fn get_all(database: &DatabaseConnection) -> Result<Vec<EntryInfoResponseSchema>, Error> {
    let entries = entry_manager::get_all(database).await.map_err(|e| {
        ErrorBuilder::new()
            .msg("Failed to query entry table while fetching all entries.")
            .from_err(e)
            .db()
            .query_failed()
    })?;
    let entries = entries.iter().map(generate_info_response).collect();

    Ok(entries)
}

pub async fn search(
    database: &DatabaseConnection,
    query: EntrySearchSchema,
) -> Result<Vec<EntryInfoResponseSchema>, Error> {
    let entries = entry_manager::search(
        database,
        query.keyword,
        query.before,
        query.after,
        query.limit,
    )
    .await
    .map_err(|e| {
        ErrorBuilder::new()
            .msg("Failed to query the entry table while searching for entries.")
            .from_err(e)
            .db()
            .query_failed()
    })?;
    let entries = entries.iter().map(generate_info_response).collect();

    Ok(entries)
}

pub async fn delete(database: &DatabaseConnection, id: i32) -> Result<(), Error> {
    entry_manager::delete(database, id).await.map_err(|e| {
        ErrorBuilder::new()
            .msg("Failed to delete an entry record.")
            .from_err(e)
            .entity(ENTRY)
            .with_id(id)
            .not_deleted()
    })?;
    Ok(())
}

pub async fn delete_many(database: &DatabaseConnection, ids: Vec<i32>) -> Result<(), Error> {
    entry_manager::delete_many(database, ids)
        .await
        .map(|_| ())
        .map_err(|e| {
            ErrorBuilder::new()
                .msg("Failed to bulk delete one or more entry records.")
                .from_err(e)
                .entity(ENTRY)
                .not_deleted()
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

pub fn generate_text_response(entry: EntryModel, text: TextNode) -> EntryArticleResponseSchema {
    EntryArticleResponseSchema {
        info: EntryInfoResponseSchema {
            id: entry.id,
            folder_id: file_manager::convert_null_folder_id_to_root(entry.folder_id),
            title: entry.title.to_owned(),
            entity_type: EntityType::from(entry.entity_type),
        },
        text,
    }
}
