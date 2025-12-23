use ::entity::{folder, folder::Entity as FolderModel};
use sea_orm::*;

use crate::database::{file_manager, utils};

pub async fn insert<C>(con: &C, parent_id: i32, name: &str) -> Result<folder::Model, DbErr>
where
    C: ConnectionTrait,
{
    let new_entity = folder::ActiveModel {
        id: NotSet,
        parent_id: Set(file_manager::convert_negative_folder_id_to_null(parent_id)),
        name: Set(name.to_string()),
    };
    match new_entity.insert(con).await {
        Ok(created_entity) => created_entity.try_into_model(),
        Err(_e) => Err(DbErr::RecordNotInserted),
    }
}

pub async fn update<C>(
    con: &C,
    id: i32,
    parent_id: Option<i32>,
    name: Option<String>,
) -> Result<folder::Model, DbErr>
where
    C: ConnectionTrait,
{
    let Some(existing_entity) = get(con, id).await? else {
        return Err(DbErr::RecordNotFound("Folder not found.".to_owned()));
    };
    let updated_entity = folder::ActiveModel {
        id: Unchanged(existing_entity.id),
        parent_id: file_manager::set_optional_folder_id(parent_id),
        name: utils::set_optional_value(name),
    };
    updated_entity.update(con).await
}

pub async fn exists<C>(con: &C, id: i32) -> Result<bool, DbErr>
where
    C: ConnectionTrait,
{
    Ok(get(con, id).await?.is_some())
}

pub async fn is_name_unique_at_location<C>(
    con: &C,
    parent_id: i32,
    name: &str,
) -> Result<bool, DbErr>
where
    C: ConnectionTrait,
{
    let mut query = FolderModel::find().filter(folder::Column::Name.eq(name));

    let parent_id = file_manager::convert_negative_folder_id_to_null(parent_id);
    if parent_id.is_none() {
        // in sqlite3, comparisons involving NULL always resolve to false,
        // so we need to explicitly check whether the value is NULL
        query = query.filter(folder::Column::ParentId.is_null());
    } else {
        query = query.filter(folder::Column::ParentId.eq(parent_id));
    }

    let colliding_siblings = query.all(con).await?;

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

pub async fn get<C>(con: &C, id: i32) -> Result<Option<folder::Model>, DbErr>
where
    C: ConnectionTrait,
{
    FolderModel::find_by_id(id).one(con).await
}

pub fn query(parent_id: Option<i32>, name: Option<String>) -> Select<FolderModel> {
    let mut query = FolderModel::find();

    if let Some(parent_id_value) = parent_id {
        let nullable_parent_id = file_manager::convert_negative_folder_id_to_null(parent_id_value);
        if nullable_parent_id.is_none() {
            query = query.filter(folder::Column::ParentId.is_null());
        } else {
            query = query.filter(folder::Column::ParentId.eq(parent_id_value));
        }
    }
    if let Some(name_value) = name {
        query = query.filter(folder::Column::Name.eq(name_value));
    }

    query
}

pub async fn get_all<C>(con: &C) -> Result<Vec<folder::Model>, DbErr>
where
    C: ConnectionTrait,
{
    FolderModel::find().all(con).await
}

pub async fn delete<C>(con: &C, id: i32) -> Result<DeleteResult, DbErr>
where
    C: ConnectionTrait,
{
    FolderModel::delete_by_id(id).exec(con).await
}

pub async fn delete_many<C>(con: &C, ids: Vec<i32>) -> Result<DeleteResult, DbErr>
where
    C: ConnectionTrait,
{
    FolderModel::delete_many()
        .filter(folder::Column::Id.is_in(ids))
        .exec(con)
        .await
}
