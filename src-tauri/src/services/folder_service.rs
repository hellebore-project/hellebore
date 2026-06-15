use futures::future;
use sea_orm::DatabaseConnection;
use uuid::Uuid;

use ::entity::folder::Model as Folder;

use crate::database::{file_manager, folder_manager};
use crate::model::errors::{Error, ErrorBuilder};
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
) -> Result<FolderResponseSchema, Error> {
    return match folder_manager::insert(database, folder.parent_id, &folder.name).await {
        Ok(entity) => Ok(generate_response(&entity)),
        Err(e) => Err(ErrorBuilder::new()
            .msg("Folder not created.")
            .from_err(e)
            .entity(FOLDER)
            .not_created()),
    };
}

pub async fn update(
    database: &DatabaseConnection,
    folder: FolderUpdateSchema,
) -> DiagnosticResponseSchema<FolderUpdateResponseSchema> {
    let mut response = FolderUpdateResponseSchema::new(&folder);
    let mut errors: Vec<Error> = Vec::new();

    if let Err(e) = folder_manager::update(database, folder.id, folder.parent_id, folder.name)
        .await
        .map_err(|e| {
            ErrorBuilder::new()
                .msg("Folder not updated.")
                .from_err(e)
                .entity(FOLDER)
                .not_updated()
        })
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
    id: Option<Uuid>,
    parent_id: Uuid,
    name: &str,
) -> Result<DiagnosticResponseSchema<FolderValidationSchema>, Error> {
    let mut errors: Vec<Error> = Vec::new();

    let is_unique = folder_manager::is_name_unique_at_location(database, parent_id, name)
        .await
        .map_err(|e| {
            ErrorBuilder::new()
                .msg("Failed to query the folder table while verifying whether a name is locally unique.")
                .from_err(e)
                .db()
                .query_failed()
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
                    ErrorBuilder::new()
                        .msg("Failed to query the folder table while fetching colliding folders.")
                        .from_err(e)
                        .db()
                        .query_failed()
                })?;

        let sibling_colliding_folder = colliding_folders
            .into_iter()
            .find(|candidate| Some(candidate.id) != id);

        if let Some(sibling_colliding_folder) = &sibling_colliding_folder {
            response.name_collision = Some(FolderNameCollisionSchema {
                is_unique,
                colliding_folder: generate_response(sibling_colliding_folder),
            });

            errors.push(
                ErrorBuilder::new()
                    .msg("Folder names must be locally unique.")
                    .entity(FOLDER)
                    .with_optional_id(&id)
                    .attribute("name")
                    .not_unique(),
            );
        }
    }

    Ok(DiagnosticResponseSchema {
        data: response,
        errors,
    })
}

pub async fn get(database: &DatabaseConnection, id: Uuid) -> Result<FolderResponseSchema, Error> {
    let folder = folder_manager::get(database, id).await.map_err(|e| {
        ErrorBuilder::new()
            .msg("Failed to query the folder table while fetching a folder by ID.")
            .from_err(e)
            .db()
            .query_failed()
    })?;
    match folder {
        Some(entity) => Ok(generate_response(&entity)),
        None => Err(ErrorBuilder::new()
            .msg("Folder not found.")
            .entity(FOLDER)
            .with_id(&id)
            .not_found()),
    }
}

pub async fn get_all(database: &DatabaseConnection) -> Result<Vec<FolderResponseSchema>, Error> {
    let folders = folder_manager::get_all(database).await.map_err(|e| {
        ErrorBuilder::new()
            .msg("Failed to query the folder table while fetching all folders.")
            .from_err(e)
            .db()
            .query_failed()
    })?;
    let folders = folders.iter().map(generate_response).collect();
    Ok(folders)
}

pub async fn delete(
    database: &DatabaseConnection,
    id: Uuid,
) -> Result<BulkFileResponseSchema, Error> {
    let contents = file_service::get_folder_contents(database, id).await?;

    let _ = folder_manager::delete(database, id).await.map_err(|e| {
        ErrorBuilder::new()
            .msg("Folder not deleted.")
            .from_err(e)
            .entity(FOLDER)
            .with_id(&id)
            .not_deleted()
    })?;

    Ok(contents)
}

pub async fn delete_many(database: &DatabaseConnection, ids: Vec<Uuid>) -> Result<(), Error> {
    folder_manager::delete_many(database, ids)
        .await
        .map(|_| ())
        .map_err(|e| {
            ErrorBuilder::new()
                .msg("One or more folders not deleted.")
                .from_err(e)
                .entity(FOLDER)
                .not_deleted()
        })
}

fn generate_response(folder: &Folder) -> FolderResponseSchema {
    FolderResponseSchema {
        id: folder.id,
        parent_id: file_manager::convert_null_folder_id_to_root(folder.parent_id),
        name: folder.name.to_string(),
    }
}
