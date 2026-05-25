use futures::future;
use sea_orm::DatabaseConnection;

use ::entity::folder::Model as Folder;

use crate::database::{file_manager, folder_manager};
use crate::model::errors::api_error::ApiError;
use crate::schema::{
    common::DiagnosticResponseSchema,
    file::BulkFileResponseSchema,
    folder::{
        FolderCreateSchema, FolderNameCollisionSchema, FolderResponseSchema,
        FolderUpdateResponseSchema, FolderUpdateSchema, FolderValidationSchema,
    },
};
use crate::services::file_service;
use crate::types::entity::FOLDER;

pub async fn create(
    database: &DatabaseConnection,
    folder: FolderCreateSchema,
) -> Result<FolderResponseSchema, ApiError> {
    return match folder_manager::insert(database, folder.parent_id, &folder.name).await {
        Ok(entity) => Ok(generate_response(&entity)),
        Err(e) => Err(ApiError::not_created("Folder not created.", FOLDER).from_error(e)),
    };
}

pub async fn update(
    database: &DatabaseConnection,
    folder: FolderUpdateSchema,
) -> DiagnosticResponseSchema<FolderUpdateResponseSchema> {
    let mut response = FolderUpdateResponseSchema::new(&folder);
    let mut errors: Vec<ApiError> = Vec::new();

    if let Err(e) = folder_manager::update(database, folder.id, folder.parent_id, folder.name)
        .await
        .map_err(|e| ApiError::not_updated("Folder not updated.", FOLDER).from_error(e))
    {
        response.parent_changed = false;
        response.name_changed = false;
        errors.push(e);
    }

    DiagnosticResponseSchema {
        data: response,
        errors,
    }
}

pub async fn bulk_update(
    database: &DatabaseConnection,
    folders: Vec<FolderUpdateSchema>,
) -> Vec<DiagnosticResponseSchema<FolderUpdateResponseSchema>> {
    future::join_all(
        folders
            .into_iter()
            .map(async |folder| update(database, folder).await),
    )
    .await
}

pub async fn validate_name(
    database: &DatabaseConnection,
    id: Option<i32>,
    parent_id: i32,
    name: &str,
) -> Result<DiagnosticResponseSchema<FolderValidationSchema>, ApiError> {
    let mut errors: Vec<ApiError> = Vec::new();

    let is_unique = folder_manager::is_name_unique_at_location(database, parent_id, name)
        .await
        .map_err(|e| {
            ApiError::db(
                "Failed to query the folder table while verifying whether a name is locally unique.",
                e,
            )
        })?;

    let mut response = FolderValidationSchema {
        id,
        parent_id,
        name: name.to_owned(),
        name_collision: None,
    };

    if !is_unique {
        let colliding_folders: Vec<Folder> =
            folder_manager::query(Some(parent_id), Some(name.to_owned()))
                .all(database)
                .await
                .map_err(|e| {
                    ApiError::db(
                        "Failed to query the folder table while fetching colliding folders.",
                        e,
                    )
                })?;

        let sibling_colliding_folder = colliding_folders
            .into_iter()
            .find(|candidate| Some(candidate.id) != id);

        if sibling_colliding_folder.is_some() {
            response.name_collision = Some(FolderNameCollisionSchema {
                is_unique,
                colliding_folder: generate_response(sibling_colliding_folder.as_ref().unwrap()),
            });

            errors.push(ApiError::field_not_unique(
                "Folder names must be locally unique.",
                FOLDER,
                id,
                "name".to_owned(),
                name,
            ));
        }
    }

    return Ok(DiagnosticResponseSchema {
        data: response,
        errors,
    });
}

pub async fn get(database: &DatabaseConnection, id: i32) -> Result<FolderResponseSchema, ApiError> {
    let folder = folder_manager::get(database, id).await.map_err(|e| {
        ApiError::db(
            "Failed to query the folder table while fetching a folder by ID.",
            e,
        )
    })?;
    return match folder {
        Some(entity) => Ok(generate_response(&entity)),
        None => {
            return Err(ApiError::not_found("Folder not found.", FOLDER));
        }
    };
}

pub async fn get_all(database: &DatabaseConnection) -> Result<Vec<FolderResponseSchema>, ApiError> {
    let folders = folder_manager::get_all(database).await.map_err(|e| {
        ApiError::db(
            "Failed to query the folder table while fetching all folders.",
            e,
        )
    })?;
    let folders = folders.iter().map(generate_response).collect();
    return Ok(folders);
}

pub async fn delete(
    database: &DatabaseConnection,
    id: i32,
) -> Result<BulkFileResponseSchema, ApiError> {
    let contents = file_service::get_folder_contents(database, id).await?;

    let _ = folder_manager::delete(database, id)
        .await
        .map_err(|e| ApiError::not_deleted("Folder not deleted.", FOLDER).from_error(e))?;

    return Ok(contents);
}

pub async fn delete_many(database: &DatabaseConnection, ids: Vec<i32>) -> Result<(), ApiError> {
    folder_manager::delete_many(database, ids)
        .await
        .map(|_| ())
        .map_err(|e| {
            ApiError::not_deleted("One or more folders not deleted.", FOLDER).from_error(e)
        })
}

fn generate_response(folder: &Folder) -> FolderResponseSchema {
    return FolderResponseSchema {
        id: folder.id,
        parent_id: file_manager::convert_null_folder_id_to_root(folder.parent_id),
        name: folder.name.to_string(),
    };
}
