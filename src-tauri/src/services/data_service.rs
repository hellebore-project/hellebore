use sea_orm::DatabaseConnection;

use crate::errors::ApiError;
use crate::schema::data::BulkDataSchema;
use crate::services::{article_service, folder_service};

pub async fn bulk_delete(
    database: &DatabaseConnection,
    data: BulkDataSchema,
) -> Result<(), ApiError> {
    if !data.articles.is_empty() {
        article_service::delete_many(database, data.articles).await?;
    }
    if !data.folders.is_empty() {
        folder_service::delete_many(database, data.folders).await?;
    }
    return Ok(());
}
