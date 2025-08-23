use sea_orm::DatabaseConnection;

use crate::database::language_manager;
use crate::errors::ApiError;
use crate::schema::{
    entry::{EntryCreateSchema, EntryInfoResponseSchema},
    language::LanguageSchema,
};
use crate::services::entry_service;
use crate::types::entity::LANGUAGE;

pub async fn create(
    database: &DatabaseConnection,
    entity: EntryCreateSchema<LanguageSchema>,
) -> Result<EntryInfoResponseSchema, ApiError> {
    let entry = entry_service::create(database, LANGUAGE, entity.folder_id, entity.title).await?;

    language_manager::insert(&database, entry.id)
        .await
        .map_err(|e| ApiError::not_inserted(e, LANGUAGE))?;

    Ok(entry_service::generate_insert_response(&entry))
}

pub async fn get() -> Result<LanguageSchema, ApiError> {
    Ok(generate_response())
}

fn generate_response() -> LanguageSchema {
    LanguageSchema {}
}
