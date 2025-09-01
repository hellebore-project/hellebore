use sea_orm::DatabaseConnection;

use ::entity::folder::Model as Folder;

use crate::database::folder_manager::{self, convert_null_folder_id_to_root};
use crate::errors::ApiError;
use crate::schema::{
    folder::{FolderCreateSchema, FolderResponseSchema, FolderUpdateSchema},
    response::ResponseDiagnosticsSchema,
};
use crate::types::entity::FOLDER;

pub async fn create(
    database: &DatabaseConnection,
    folder: FolderCreateSchema,
) -> Result<FolderResponseSchema, ApiError> {
    return match folder_manager::insert(database, folder.parent_id, &folder.name).await {
        Ok(entity) => Ok(generate_response(&entity)),
        Err(e) => Err(ApiError::not_inserted(e, FOLDER)),
    };
}

pub async fn update(
    database: &DatabaseConnection,
    folder: FolderUpdateSchema,
) -> Result<FolderResponseSchema, ApiError> {
    return match folder_manager::update(database, folder.id, folder.parent_id, folder.name).await {
        Ok(entity) => Ok(generate_response(&entity)),
        Err(e) => Err(ApiError::not_updated(e, FOLDER)),
    };
}

pub async fn validate_name(
    database: &DatabaseConnection,
    id: Option<i32>,
    parent_id: i32,
    name: &str,
) -> Result<ResponseDiagnosticsSchema<bool>, ApiError> {
    let mut errors: Vec<ApiError> = Vec::new();
    let is_unique = folder_manager::is_name_unique_at_location(database, parent_id, name)
        .await
        .map_err(|e| ApiError::query_failed(e, FOLDER))?;
    if !is_unique {
        errors.push(ApiError::field_not_unique(
            FOLDER,
            id,
            "name".to_owned(),
            name,
        ));
    }
    return Ok(ResponseDiagnosticsSchema {
        data: is_unique,
        errors,
    });
}

pub async fn get(database: &DatabaseConnection, id: i32) -> Result<FolderResponseSchema, ApiError> {
    let folder = folder_manager::get(database, id)
        .await
        .map_err(|e| ApiError::not_found(e, FOLDER))?;
    return match folder {
        Some(entity) => Ok(generate_response(&entity)),
        None => return Err(ApiError::not_found("Folder not found.", FOLDER)),
    };
}

pub async fn get_all(database: &DatabaseConnection) -> Result<Vec<FolderResponseSchema>, ApiError> {
    let folders = folder_manager::get_all(database)
        .await
        .map_err(|e| ApiError::not_found(e, FOLDER))?;
    let folders = folders.iter().map(generate_response).collect();
    return Ok(folders);
}

pub async fn delete(database: &DatabaseConnection, id: i32) -> Result<(), ApiError> {
    let _ = folder_manager::delete(database, id)
        .await
        .map_err(|e| ApiError::not_deleted(e, FOLDER))?;
    return Ok(());
}

pub async fn delete_many(database: &DatabaseConnection, ids: Vec<i32>) -> Result<(), ApiError> {
    folder_manager::delete_many(database, ids)
        .await
        .map(|_| ())
        .map_err(|e| ApiError::not_deleted(e, FOLDER))
}

fn generate_response(folder: &Folder) -> FolderResponseSchema {
    return FolderResponseSchema {
        id: folder.id,
        parent_id: convert_null_folder_id_to_root(folder.parent_id),
        name: folder.name.to_string(),
    };
}
