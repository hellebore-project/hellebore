use sea_orm::DatabaseConnection;

use crate::errors::ApiError;
use crate::schema::data::BulkDataSchema;
use crate::services::{entry_service, folder_service};

pub async fn bulk_delete(
    database: &DatabaseConnection,
    data: BulkDataSchema,
) -> Result<(), ApiError> {
    if !data.entities.is_empty() {
        entry_service::delete_many(database, data.entities).await?;
    }
    if !data.folders.is_empty() {
        folder_service::delete_many(database, data.folders).await?;
    }
    return Ok(());
}
