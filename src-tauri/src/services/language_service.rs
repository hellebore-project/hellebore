use sea_orm::DatabaseConnection;

use crate::database::{entry_manager, language_manager, transaction_manager};
use crate::errors::ApiError;
use crate::schema::{
    entry::{EntryCreateSchema, EntryInfoResponseSchema},
    language::LanguageSchema,
};
use crate::services::entry_service;
use crate::types::entity::{ENTRY, LANGUAGE};

pub async fn create(
    database: &DatabaseConnection,
    entity: EntryCreateSchema<LanguageSchema>,
) -> Result<EntryInfoResponseSchema, ApiError> {
    let txn = transaction_manager::begin(database).await?;

    let entry = entry_manager::insert(
        &txn,
        LANGUAGE,
        entity.folder_id,
        entity.title,
        "".to_owned(),
    )
    .await
    .map_err(|e| ApiError::not_inserted(e, ENTRY))?;

    language_manager::insert(&txn, entry.id)
        .await
        .map_err(|e| ApiError::not_inserted(e, LANGUAGE))?;

    transaction_manager::end(txn).await?;
    Ok(entry_service::generate_insert_response(&entry))
}

pub async fn get() -> Result<LanguageSchema, ApiError> {
    Ok(generate_response())
}

fn generate_response() -> LanguageSchema {
    LanguageSchema {}
}
