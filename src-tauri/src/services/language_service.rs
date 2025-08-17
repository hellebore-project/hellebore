use sea_orm::DatabaseConnection;

use crate::database::language_manager;
use crate::errors::ApiError;
use crate::schema::{
    entry::{EntryCreateSchema, EntryInfoSchema},
    language::LanguageDataSchema,
};
use crate::services::entry_service;
use crate::types::LANGUAGE;

pub async fn create(
    database: &DatabaseConnection,
    entity: EntryCreateSchema<LanguageDataSchema>,
) -> Result<EntryInfoSchema, ApiError> {
    let entry = entry_service::create(database, LANGUAGE, entity.folder_id, entity.title).await?;

    language_manager::insert(&database, entry.id)
        .await
        .map_err(|e| ApiError::not_inserted(e, LANGUAGE))?;

    Ok(entry_service::generate_insert_response(&entry))
}

pub async fn delete(database: &DatabaseConnection, id: i32) -> Result<(), ApiError> {
    entry_service::delete(&database, id).await?;
    return Ok(());
}
