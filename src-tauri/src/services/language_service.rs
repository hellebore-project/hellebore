use sea_orm::ConnectionTrait;

use crate::database::language_manager;
use crate::model::errors::api_error::ApiError;
use crate::schema::language::LanguageSchema;
use crate::types::entity::LANGUAGE;

pub async fn create<C>(con: &C, entry_id: i32) -> Result<(), ApiError>
where
    C: ConnectionTrait,
{
    language_manager::insert(con, entry_id).await.map_err(|e| {
        ApiError::not_created("Failed to create language record", LANGUAGE, Some(e))
    })?;

    Ok(())
}

pub async fn get() -> Result<LanguageSchema, ApiError> {
    Ok(generate_response())
}

fn generate_response() -> LanguageSchema {
    LanguageSchema {}
}
