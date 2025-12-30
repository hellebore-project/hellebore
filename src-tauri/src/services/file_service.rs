use sea_orm::DatabaseConnection;

use crate::database::file_manager;
use crate::model::errors::api_error::ApiError;
use crate::schema::file::BulkFileResponseSchema;

pub async fn get_folder_contents(
    database: &DatabaseConnection,
    folder_id: i32,
) -> Result<BulkFileResponseSchema, ApiError> {
    let contents = file_manager::get_folder_contents(database, folder_id)
        .await
        .map_err(|e| ApiError::db("Failed to query the contents of a folder.", e))?;

    return Ok(generate_bulk_file_response(contents));
}

fn generate_bulk_file_response(file_nodes: Vec<file_manager::FileNode>) -> BulkFileResponseSchema {
    let mut entries: Vec<i32> = Vec::new();
    let mut folders: Vec<i32> = Vec::new();

    for file_node in file_nodes.iter() {
        if file_node.node_type == "folder" {
            folders.push(file_node.id);
        } else {
            entries.push(file_node.id);
        }
    }

    BulkFileResponseSchema { entries, folders }
}
