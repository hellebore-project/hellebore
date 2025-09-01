use ::entity::{entry, entry::Entity as EntryModel};
use sea_orm::*;

use crate::{
    database::folder_manager::convert_negative_folder_id_to_null, types::entity::EntityType,
    utils::CodedEnum,
};

#[derive(DerivePartialModel, FromQueryResult)]
#[sea_orm(entity = "EntryModel")]
pub struct EntityInfo {
    pub id: i32,
    pub folder_id: Option<i32>,
    pub entity_type: i8,
    pub title: String,
}

pub async fn insert<C>(
    con: &C,
    entity_type: EntityType,
    folder_id: i32,
    title: String,
    text: String,
) -> Result<entry::Model, DbErr>
where
    C: ConnectionTrait,
{
    let new_entity = entry::ActiveModel {
        id: NotSet,
        folder_id: Set(convert_negative_folder_id_to_null(folder_id)),
        title: Set(title),
        entity_type: Set(entity_type.code()),
        text: Set(text),
    };
    match new_entity.insert(con).await {
        Ok(created_entity) => created_entity.try_into_model(),
        Err(_e) => Err(DbErr::RecordNotInserted),
    }
}

pub async fn update_title<C>(con: &C, id: i32, title: String) -> Result<entry::Model, DbErr>
where
    C: ConnectionTrait,
{
    let Some(existing_entity) = get_info(con, id).await? else {
        return Err(DbErr::RecordNotFound("Entity not found.".to_owned()));
    };
    let updated_entity = entry::ActiveModel {
        id: Unchanged(existing_entity.id),
        folder_id: NotSet,
        entity_type: NotSet,
        title: Set(title),
        text: NotSet,
    };
    updated_entity.update(con).await
}

pub async fn update_folder<C>(con: &C, id: i32, folder_id: i32) -> Result<entry::Model, DbErr>
where
    C: ConnectionTrait,
{
    let Some(folder) = get_info(con, id).await? else {
        return Err(DbErr::RecordNotFound("Entity not found.".to_owned()));
    };
    let folder = entry::ActiveModel {
        id: Unchanged(folder.id),
        folder_id: Set(convert_negative_folder_id_to_null(folder_id)),
        entity_type: NotSet,
        title: NotSet,
        text: NotSet,
    };
    folder.update(con).await
}

pub async fn update_text<C>(con: &C, id: i32, text: String) -> Result<entry::Model, DbErr>
where
    C: ConnectionTrait,
{
    let Some(existing_entity) = get_info(con, id).await? else {
        return Err(DbErr::RecordNotFound("Entity not found.".to_owned()));
    };
    let updated_entity = entry::ActiveModel {
        id: Unchanged(existing_entity.id),
        folder_id: NotSet,
        entity_type: NotSet,
        title: NotSet,
        text: Set(text),
    };
    updated_entity.update(con).await
}

pub async fn exists<C>(con: &C, id: i32) -> Result<bool, DbErr>
where
    C: ConnectionTrait,
{
    return Ok(get_info(con, id).await?.is_some());
}

pub async fn title_exists<C>(con: &C, title: &str) -> Result<bool, DbErr>
where
    C: ConnectionTrait,
{
    return Ok(get_by_title(con, title).await?.is_some());
}

pub async fn is_title_unique_for_id<C>(con: &C, id: Option<i32>, title: &str) -> Result<bool, DbErr>
where
    C: ConnectionTrait,
{
    let entity = get_by_title(con, title).await?;
    return match entity {
        Some(a) => match id {
            Some(id) => Ok(a.id == id),
            None => Ok(false),
        },
        None => Ok(true),
    };
}

pub async fn get<C>(con: &C, id: i32) -> Result<Option<entry::Model>, DbErr>
where
    C: ConnectionTrait,
{
    EntryModel::find_by_id(id).one(con).await
}

pub async fn get_by_title<C>(con: &C, title: &str) -> Result<Option<EntityInfo>, DbErr>
where
    C: ConnectionTrait,
{
    EntryModel::find()
        .filter(entry::Column::Title.eq(title))
        .into_partial_model::<EntityInfo>()
        .one(con)
        .await
}

pub async fn get_info<C>(con: &C, id: i32) -> Result<Option<EntityInfo>, DbErr>
where
    C: ConnectionTrait,
{
    EntryModel::find_by_id(id)
        .into_partial_model::<EntityInfo>()
        .one(con)
        .await
}

pub async fn get_all<C>(con: &C) -> Result<Vec<EntityInfo>, DbErr>
where
    C: ConnectionTrait,
{
    EntryModel::find()
        .order_by_asc(entry::Column::Title)
        .into_partial_model::<EntityInfo>()
        .all(con)
        .await
}

pub async fn delete<C>(con: &C, id: i32) -> Result<DeleteResult, DbErr>
where
    C: ConnectionTrait,
{
    EntryModel::delete_by_id(id).exec(con).await
}

pub async fn delete_many<C>(con: &C, ids: Vec<i32>) -> Result<DeleteResult, DbErr>
where
    C: ConnectionTrait,
{
    EntryModel::delete_many()
        .filter(entry::Column::Id.is_in(ids))
        .exec(con)
        .await
}
