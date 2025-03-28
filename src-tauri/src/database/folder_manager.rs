use ::entity::{folder, folder::Entity as FolderEntity};
use sea_orm::*;

use crate::database::utils;

static NO_FOLDER_SENTINEL: i32 = -1;

#[derive(DerivePartialModel, FromQueryResult)]
#[sea_orm(entity = "FolderEntity")]
pub struct Folder {
    pub id: i32,
    _parent_id: Option<i32>,
    pub name: String,
}

impl Folder {
    pub fn parent_id(&self) -> i32 {
        convert_null_folder_id_to_sentinel(self._parent_id)
    }
}

pub async fn insert(db: &DbConn, parent_id: i32, name: &str) -> Result<Folder, DbErr> {
    let new_entity = folder::ActiveModel {
        id: NotSet,
        parent_id: Set(convert_folder_id_sentinel_to_none(parent_id)),
        name: Set(name.to_string()),
    };
    match new_entity.insert(db).await {
        Ok(created_entity) => Ok(Folder {
            id: created_entity.id,
            _parent_id: created_entity.parent_id,
            name: created_entity.name,
        }),
        Err(_e) => Err(DbErr::RecordNotInserted),
    }
}

pub async fn update(
    db: &DbConn,
    id: i32,
    parent_id: Option<i32>,
    name: Option<String>,
) -> Result<Folder, DbErr> {
    let Some(existing_entity) = get(db, id).await? else {
        return Err(DbErr::RecordNotFound("Folder not found.".to_owned()));
    };
    let updated_entity = folder::ActiveModel {
        id: Unchanged(existing_entity.id),
        parent_id: convert_optional_folder_id_to_active_value(parent_id),
        name: utils::set_value_or_null(name),
    };
    let updated_entity = updated_entity.update(db).await?;
    Ok(Folder {
        id: updated_entity.id,
        _parent_id: updated_entity.parent_id,
        name: updated_entity.name,
    })
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
    let parent_id = convert_folder_id_sentinel_to_none(parent_id);
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

pub async fn get(db: &DbConn, id: i32) -> Result<Option<Folder>, DbErr> {
    FolderEntity::find_by_id(id)
        .into_partial_model::<Folder>()
        .one(db)
        .await
}

pub async fn get_all(db: &DbConn) -> Result<Vec<Folder>, DbErr> {
    FolderEntity::find()
        .into_partial_model::<Folder>()
        .all(db)
        .await
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

/// Convert a mandatory folder ID API argument into its database representation.
/// If `id` is a positive integer, then it is returned as is.
/// Otherwise, if `id` is a negative integer, then `None` is returned.
pub fn convert_folder_id_sentinel_to_none(id: i32) -> Option<i32> {
    if id > NO_FOLDER_SENTINEL {
        Some(id) // ID of existing folder
    } else {
        None // no folder ID
    }
}

/// Convert an optional folder ID API argument into a stateful database value.
/// If `id` is a positive integer, then it is set in the database as is.
/// If `id` is a negative integer, then `None` is set in the database.
/// If `id` is `None`, then the value is not set in the database.
pub fn convert_optional_folder_id_to_active_value(id: Option<i32>) -> ActiveValue<Option<i32>> {
    match id {
        Some(id) => ActiveValue::Set(convert_folder_id_sentinel_to_none(id)), // value is set in the DB
        None => ActiveValue::NotSet, // no value is set in the DB
    }
}

/// Convert the database representation of a folder ID into an API response value.
/// If `id` is an integer, then it is returned as is. Otherwise, if `is` is `None`,
/// then the no-folder sentinel value is returned,
pub fn convert_null_folder_id_to_sentinel(id: Option<i32>) -> i32 {
    match id {
        Some(i) => i, // expect to be a positive integer
        None => NO_FOLDER_SENTINEL,
    }
}
