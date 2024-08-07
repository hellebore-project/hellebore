use ::entity::{article, article::Entity as Article};
use sea_orm::*;

use crate::types::EntityType;

pub async fn insert(
    db: &DbConn,
    title: &str,
    entity_type: EntityType
) -> Result<article::Model, DbErr> {
    let new_entity = article::ActiveModel {
        title: Set(title.to_string()),
        entity_type: Set(entity_type.name()),
        ..Default::default()
    };
    match new_entity.save(db).await {
        Ok(created_entity) => created_entity.try_into_model(),
        Err(_e) => Err(DbErr::RecordNotInserted),
    }
}

pub async fn update(
    db: &DbConn,
    id: i32,
    title: &str,
) -> Result<article::Model, DbErr> {
    let Some(existing_entity) = get(db, id).await?
    else {
        return Err(DbErr::RecordNotFound("Article not found.".to_owned()));
    };
    let updated_entity = article::ActiveModel {
        id: Unchanged(existing_entity.id),
        title: Set(title.to_string()),
        entity_type: NotSet,
    };
    updated_entity.update(db).await
}

pub async fn exists(db: &DbConn, id: i32) -> Result<bool, DbErr> {
    return Ok(get(db, id).await?.is_some());
}

pub async fn is_title_unique(db: &DbConn, title: &str) -> Result<bool, DbErr> {
    return Ok(get_by_title(db, title).await?.is_none());
}

pub async fn get(db: &DbConn, id: i32) -> Result<Option<article::Model>, DbErr> {
    Article::find_by_id(id)
        .one(db)
        .await
}

pub async fn get_by_title(db: &DbConn, title: &str) -> Result<Option<article::Model>, DbErr> {
    Article::find()
        .filter(article::Column::Title.eq(title))
        .one(db)
        .await
}

pub async fn get_all(db: &DbConn) -> Result<Vec<article::Model>, DbErr> {
    Article::find()
        .order_by_asc(article::Column::Id)
        .all(db)
        .await
}

pub async fn delete(db: &DbConn, id: i32) -> Result<DeleteResult, DbErr> {
    let Some(existing_entity) = get(db, id).await? else {
        return Err(DbErr::RecordNotFound(String::from("Article not found.")));
    };
    existing_entity.delete(db).await
}