use sea_orm::DatabaseConnection;

use ::entity::folder::Model as Folder;

use crate::database::folder_manager;
use crate::errors::ApiError;
use crate::schema::{
    folder::{FolderInfoSchema, FolderSchema},
    response::ResponseSchema,
};
use crate::types::FOLDER;

pub async fn create(
    database: &DatabaseConnection,
    folder: &FolderInfoSchema,
) -> Result<FolderSchema, ApiError> {
    return match folder_manager::insert(&database, folder.parent_id, &folder.name).await {
        Ok(entity) => Ok(generate_response(&entity)),
        Err(e) => Err(ApiError::not_inserted(e, FOLDER)),
    };
}

pub async fn update(
    database: &DatabaseConnection,
    folder: &FolderSchema,
) -> Result<FolderSchema, ApiError> {
    return match folder_manager::update(
        &database,
        folder.id,
        folder.info.parent_id,
        &folder.info.name,
    )
    .await
    {
        Ok(entity) => Ok(generate_response(&entity)),
        Err(e) => Err(ApiError::not_updated(e, FOLDER)),
    };
}

pub async fn validate_name(
    database: &DatabaseConnection,
    id: Option<i32>,
    parent_id: i32,
    name: &str,
) -> Result<ResponseSchema<bool>, ApiError> {
    let mut errors: Vec<ApiError> = Vec::new();
    let is_unique = folder_manager::is_name_unique_for_id(&database, id, parent_id, name)
        .await
        .map_err(|e| ApiError::query_failed(e, FOLDER))?;
    if !is_unique {
        errors.push(ApiError::field_not_unique(
            FOLDER,
            id,
            &String::from("name"),
            name,
        ));
    }
    return Ok(ResponseSchema {
        data: is_unique,
        errors,
    });
}

pub async fn get(database: &DatabaseConnection, id: i32) -> Result<FolderSchema, ApiError> {
    let folder = folder_manager::get(&database, id)
        .await
        .map_err(|e| ApiError::not_found(e, FOLDER))?;
    return match folder {
        Some(entity) => Ok(generate_response(&entity)),
        None => return Err(ApiError::not_found("Folder not found.", FOLDER)),
    };
}

pub async fn get_all(database: &DatabaseConnection) -> Result<Vec<FolderSchema>, ApiError> {
    let folders = folder_manager::get_all(&database)
        .await
        .map_err(|e| ApiError::not_found(e, FOLDER))?;
    let folders = folders.iter().map(generate_response).collect();
    return Ok(folders);
}

pub async fn delete(database: &DatabaseConnection, id: i32) -> Result<(), ApiError> {
    let exists = folder_manager::exists(&database, id)
        .await
        .map_err(|e| ApiError::query_failed(e, FOLDER))?;
    if !exists {
        return Err(ApiError::not_found("Language not found.", FOLDER));
    }
    let _ = folder_manager::delete(&database, id)
        .await
        .map_err(|e| ApiError::not_deleted(e, FOLDER))?;
    return Ok(());
}

fn generate_response(folder: &Folder) -> FolderSchema {
    return FolderSchema {
        id: folder.id,
        info: FolderInfoSchema {
            parent_id: folder_manager::convert_null_folder_id_to_sentinel(folder.parent_id),
            name: folder.name.to_string(),
        },
    };
}
