use ::entity::{folder, folder::Entity as Folder};
use sea_orm::*;

pub async fn insert(db: &DbConn, parent_id: i32, name: &str) -> Result<folder::Model, DbErr> {
    let new_entity = folder::ActiveModel {
        id: NotSet,
        parent_id: Set(convert_folder_id_sentinel_to_none(parent_id)),
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
    parent_id: i32,
    name: &str,
) -> Result<folder::Model, DbErr> {
    let Some(existing_entity) = get(db, id).await? else {
        return Err(DbErr::RecordNotFound("Folder not found.".to_owned()));
    };
    let updated_entity = folder::ActiveModel {
        id: Unchanged(existing_entity.id),
        parent_id: Set(convert_folder_id_sentinel_to_none(parent_id)),
        name: Set(name.to_string()),
    };
    updated_entity.update(db).await
}

pub async fn exists(db: &DbConn, id: i32) -> Result<bool, DbErr> {
    return Ok(get(db, id).await?.is_some());
}

pub async fn get(db: &DbConn, id: i32) -> Result<Option<folder::Model>, DbErr> {
    Folder::find_by_id(id).one(db).await
}

pub async fn get_all(db: &DbConn) -> Result<Vec<folder::Model>, DbErr> {
    Folder::find().all(db).await
}

pub async fn delete(db: &DbConn, id: i32) -> Result<DeleteResult, DbErr> {
    let Some(existing_entity) = get(db, id).await? else {
        return Err(DbErr::RecordNotFound(String::from("Folder not found.")));
    };
    existing_entity.delete(db).await
}

pub fn convert_folder_id_sentinel_to_none(id: i32) -> Option<i32> {
    if id >= 0 {
        Some(id)
    } else {
        None
    }
}

pub fn convert_null_folder_id_to_sentinel(id: Option<i32>) -> i32 {
    match id {
        Some(i) => i,
        None => -1,
    }
}

pub fn optional_folder_id_to_active_value(id: Option<i32>) -> ActiveValue<Option<i32>> {
    match id {
        Some(v) => ActiveValue::Set(convert_folder_id_sentinel_to_none(v)),
        None => ActiveValue::NotSet,
    }
}
