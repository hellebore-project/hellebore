use ::entity::{folder, folder::Entity as FolderEntity};
use sea_orm::*;

use crate::database::utils;

pub const ROOT_FOLDER_ID: i32 = -1;

pub async fn insert(db: &DbConn, parent_id: i32, name: &str) -> Result<folder::Model, DbErr> {
    let new_entity = folder::ActiveModel {
        id: NotSet,
        parent_id: Set(convert_negative_folder_id_to_root(parent_id)),
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

pub async fn is_name_unique_for_id(
    db: &DbConn,
    id: Option<i32>,
    parent_id: i32,
    name: &str,
) -> Result<bool, DbErr> {
    let parent_id = convert_negative_folder_id_to_root(parent_id);
    let entities = FolderEntity::find()
        .filter(folder::Column::ParentId.eq(parent_id))
        .filter(folder::Column::Name.eq(name))
        .all(db)
        .await?;
    if entities.len() == 0 {
        return Ok(true);
    }
    if entities.len() > 1 {
        // this case should never happen
        // TODO: log a warning
        return Ok(false);
    }
    if id.is_some() && entities[0].id == id.unwrap() {
        return Ok(true);
    }
    Ok(false)
}

pub async fn get(db: &DbConn, id: i32) -> Result<Option<folder::Model>, DbErr> {
    FolderEntity::find_by_id(id).one(db).await
}

pub async fn get_all(db: &DbConn) -> Result<Vec<folder::Model>, DbErr> {
    FolderEntity::find().all(db).await
}

pub async fn delete(db: &DbConn, id: i32) -> Result<DeleteResult, DbErr> {
    let existing_entity = FolderEntity::find_by_id(id).one(db).await?;
    let Some(existing_entity) = existing_entity else {
        return Err(DbErr::RecordNotFound(String::from("Folder not found.")));
    };
    existing_entity.delete(db).await
}

pub async fn delete_many(db: &DbConn, ids: Vec<i32>) -> Result<DeleteResult, DbErr> {
    FolderEntity::delete_many()
        .filter(folder::Column::Id.is_in(ids))
        .exec(db)
        .await
}

/// Cleans negative folder IDs to the root folder ID.
/// If `id` is a positive integer, then it is returned as is.
/// Otherwise, if `id` is a negative integer, then the root ID is returned.
pub fn convert_negative_folder_id_to_root(id: i32) -> i32 {
    if id > ROOT_FOLDER_ID {
        id // ID of existing folder
    } else {
        ROOT_FOLDER_ID // root folder ID
    }
}

/// Convert an optional folder ID API argument into a stateful database value.
/// If `id` is a positive integer, then it is set in the database as is.
/// If `id` is a negative integer, then the root folder ID is set in the database.
/// If `id` is `None`, then the value is not set in the database.
pub fn convert_optional_folder_id_to_active_value(id: Option<i32>) -> ActiveValue<i32> {
    match id {
        Some(id) => ActiveValue::Set(convert_negative_folder_id_to_root(id)), // value is set in the DB
        None => ActiveValue::NotSet, // no value is set in the DB
    }
}
