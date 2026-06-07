use sea_orm::ConnectionTrait;

use crate::database::language_manager;
use crate::model::errors::{Error, ErrorBuilder};
use crate::schema::language::LanguageSchema;
use crate::types::entity::LANGUAGE;

pub async fn create<C>(con: &C, entry_id: i32) -> Result<(), Error>
where
    C: ConnectionTrait,
{
    language_manager::insert(con, entry_id).await.map_err(|e| {
        ErrorBuilder::new()
            .msg("Failed to create language record.")
            .from_err(e)
            .entity(LANGUAGE)
            .not_created()
    })?;

    Ok(())
}

pub async fn get() -> Result<LanguageSchema, Error> {
    Ok(generate_response())
}

fn generate_response() -> LanguageSchema {
    LanguageSchema {}
}
