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

pub async fn insert(
    db: &DbConn,
    folder_id: i32,
    title: String,
    entity_type: EntityType,
    text: String,
) -> Result<entry::Model, DbErr> {
    let new_entity = entry::ActiveModel {
        id: NotSet,
        folder_id: Set(convert_negative_folder_id_to_null(folder_id)),
        title: Set(title),
        entity_type: Set(entity_type.code()),
        text: Set(text),
    };
    match new_entity.insert(db).await {
        Ok(created_entity) => created_entity.try_into_model(),
        Err(_e) => Err(DbErr::RecordNotInserted),
    }
}

pub async fn update_title(db: &DbConn, id: i32, title: String) -> Result<entry::Model, DbErr> {
    let Some(existing_entity) = get_info(db, id).await? else {
        return Err(DbErr::RecordNotFound("Entity not found.".to_owned()));
    };
    let updated_entity = entry::ActiveModel {
        id: Unchanged(existing_entity.id),
        folder_id: NotSet,
        entity_type: NotSet,
        title: Set(title),
        text: NotSet,
    };
    updated_entity.update(db).await
}

pub async fn update_folder(db: &DbConn, id: i32, folder_id: i32) -> Result<entry::Model, DbErr> {
    let Some(folder) = get_info(db, id).await? else {
        return Err(DbErr::RecordNotFound("Entity not found.".to_owned()));
    };
    let folder = entry::ActiveModel {
        id: Unchanged(folder.id),
        folder_id: Set(convert_negative_folder_id_to_null(folder_id)),
        entity_type: NotSet,
        title: NotSet,
        text: NotSet,
    };
    folder.update(db).await
}

pub async fn update_text(db: &DbConn, id: i32, text: String) -> Result<entry::Model, DbErr> {
    let Some(existing_entity) = get_info(db, id).await? else {
        return Err(DbErr::RecordNotFound("Entity not found.".to_owned()));
    };
    let updated_entity = entry::ActiveModel {
        id: Unchanged(existing_entity.id),
        folder_id: NotSet,
        entity_type: NotSet,
        title: NotSet,
        text: Set(text),
    };
    updated_entity.update(db).await
}

pub async fn exists(db: &DbConn, id: i32) -> Result<bool, DbErr> {
    return Ok(get_info(db, id).await?.is_some());
}

pub async fn title_exists(db: &DbConn, title: &str) -> Result<bool, DbErr> {
    return Ok(get_by_title(db, title).await?.is_some());
}

pub async fn is_title_unique_for_id(
    db: &DbConn,
    id: Option<i32>,
    title: &str,
) -> Result<bool, DbErr> {
    let entity = get_by_title(db, title).await?;
    return match entity {
        Some(a) => match id {
            Some(id) => Ok(a.id == id),
            None => Ok(false),
        },
        None => Ok(true),
    };
}

pub async fn get(db: &DbConn, id: i32) -> Result<Option<entry::Model>, DbErr> {
    EntryModel::find_by_id(id).one(db).await
}

pub async fn get_by_title(db: &DbConn, title: &str) -> Result<Option<EntityInfo>, DbErr> {
    EntryModel::find()
        .filter(entry::Column::Title.eq(title))
        .into_partial_model::<EntityInfo>()
        .one(db)
        .await
}

pub async fn get_info(db: &DbConn, id: i32) -> Result<Option<EntityInfo>, DbErr> {
    EntryModel::find_by_id(id)
        .into_partial_model::<EntityInfo>()
        .one(db)
        .await
}

pub async fn get_all(db: &DbConn) -> Result<Vec<EntityInfo>, DbErr> {
    EntryModel::find()
        .order_by_asc(entry::Column::Title)
        .into_partial_model::<EntityInfo>()
        .all(db)
        .await
}

pub async fn delete(db: &DbConn, id: i32) -> Result<DeleteResult, DbErr> {
    EntryModel::delete_by_id(id).exec(db).await
}

pub async fn delete_many(db: &DbConn, ids: Vec<i32>) -> Result<DeleteResult, DbErr> {
    EntryModel::delete_many()
        .filter(entry::Column::Id.is_in(ids))
        .exec(db)
        .await
}
