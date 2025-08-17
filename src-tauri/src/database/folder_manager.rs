use ::entity::{folder, folder::Entity as FolderModel};
use sea_orm::*;

use crate::database::utils;

pub const ROOT_FOLDER_ID: i32 = -1;

pub async fn insert(db: &DbConn, parent_id: i32, name: &str) -> Result<folder::Model, DbErr> {
    let new_entity = folder::ActiveModel {
        id: NotSet,
        parent_id: Set(convert_negative_folder_id_to_null(parent_id)),
        name: Set(name.to_string()),
    };
    match new_entity.insert(db).await {
        Ok(created_entity) => created_entity.try_into_model(),
        Err(_e) => Err(DbErr::RecordNotInserted),
    }
}

pub async fn update(
    db: &DbConn,
    id: i32,
    parent_id: Option<i32>,
    name: Option<String>,
) -> Result<folder::Model, DbErr> {
    let Some(existing_entity) = get(db, id).await? else {
        return Err(DbErr::RecordNotFound("Folder not found.".to_owned()));
    };
    let updated_entity = folder::ActiveModel {
        id: Unchanged(existing_entity.id),
        parent_id: convert_optional_folder_id_to_active_value(parent_id),
        name: utils::set_value_or_null(name),
    };
    updated_entity.update(db).await
}

pub async fn exists(db: &DbConn, id: i32) -> Result<bool, DbErr> {
    Ok(get(db, id).await?.is_some())
}

pub async fn is_name_unique_at_location(
    db: &DbConn,
    parent_id: i32,
    name: &str,
) -> Result<bool, DbErr> {
    let parent_id = convert_negative_folder_id_to_null(parent_id);
    let colliding_siblings = FolderModel::find()
        .filter(folder::Column::ParentId.eq(parent_id))
        .filter(folder::Column::Name.eq(name))
        .all(db)
        .await?;

    if colliding_siblings.len() == 0 {
        return Ok(true);
    }

    if colliding_siblings.len() > 1 {
        // there should never be more than one collision;
        // if the DB has reached this state, then something has gone wrong
        // TODO: log an error
    }

    Ok(false)
}

pub async fn get(db: &DbConn, id: i32) -> Result<Option<folder::Model>, DbErr> {
    FolderModel::find_by_id(id).one(db).await
}

pub async fn get_all(db: &DbConn) -> Result<Vec<folder::Model>, DbErr> {
    FolderModel::find().all(db).await
}

pub async fn delete(db: &DbConn, id: i32) -> Result<DeleteResult, DbErr> {
    FolderModel::delete_by_id(id).exec(db).await
}

pub async fn delete_many(db: &DbConn, ids: Vec<i32>) -> Result<DeleteResult, DbErr> {
    FolderModel::delete_many()
        .filter(folder::Column::Id.is_in(ids))
        .exec(db)
        .await
}

/// Cleans negative folder IDs to null.
pub fn convert_negative_folder_id_to_null(id: i32) -> Option<i32> {
    if id > ROOT_FOLDER_ID {
        Some(id) // ID of existing folder
    } else {
        None // root folder ID
    }
}

/// Cleans null folder IDs to the root folder ID.
pub fn convert_null_folder_id_to_root(id: Option<i32>) -> i32 {
    if id.is_none() {
        return ROOT_FOLDER_ID;
    }
    id.unwrap()
}

/// Convert an optional folder ID API argument into a stateful database value.
/// If `id` is a positive integer, then it is set in the database as is.
/// If `id` is a negative integer, then `None` is set in the database.
/// If `id` is `None`, then the value is not set in the database.
pub fn convert_optional_folder_id_to_active_value(id: Option<i32>) -> ActiveValue<Option<i32>> {
    match id {
        Some(id) => ActiveValue::Set(convert_negative_folder_id_to_null(id)), // value is set in the DB
        None => ActiveValue::NotSet, // no value is set in the DB
    }
}
