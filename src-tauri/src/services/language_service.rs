use sea_orm::DatabaseConnection;

use crate::database::{entry_manager, language_manager};
use crate::errors::ApiError;
use crate::schema::{
    entry::{EntryCreateSchema, EntryInfoSchema},
    language::LanguageDataSchema,
};
use crate::services::entry_service;
use crate::types::{ENTRY, LANGUAGE};

pub async fn create(
    database: &DatabaseConnection,
    entity: EntryCreateSchema<LanguageDataSchema>,
) -> Result<EntryInfoSchema, ApiError> {
    let entity = entry_manager::insert(
        &database,
        entity.folder_id,
        entity.title.to_owned(),
        LANGUAGE,
        "".to_owned(),
    )
    .await
    .map_err(|e| ApiError::not_inserted(e, ENTRY))?;
    return match language_manager::insert(&database, entity.id).await {
        Ok(_) => Ok(entry_service::generate_insert_response(&entity)),
        Err(e) => Err(ApiError::not_inserted(e, LANGUAGE)),
    };
}

pub async fn delete(database: &DatabaseConnection, id: i32) -> Result<(), ApiError> {
    entry_service::delete(&database, id).await?;
    return Ok(());
}
