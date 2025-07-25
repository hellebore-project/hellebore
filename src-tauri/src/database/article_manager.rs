use ::entity::{article, article::Entity as ArticleEntity};
use sea_orm::*;

use crate::types::{CodedEnum, EntityType};

#[derive(DerivePartialModel, FromQueryResult)]
#[sea_orm(entity = "ArticleEntity")]
pub struct ArticleInfo {
    pub id: i32,
    pub folder_id: i32,
    pub entity_type: i8,
    pub title: String,
}

#[derive(DerivePartialModel, FromQueryResult)]
#[sea_orm(entity = "ArticleEntity")]
pub struct Article {
    pub id: i32,
    pub folder_id: i32,
    pub entity_type: i8,
    pub title: String,
    pub body: String,
}

pub async fn insert(
    db: &DbConn,
    folder_id: i32,
    title: String,
    entity_type: EntityType,
    text: String,
) -> Result<article::Model, DbErr> {
    let new_entity = article::ActiveModel {
        id: NotSet,
        folder_id: Set(folder_id),
        title: Set(title),
        entity_type: Set(entity_type.code()),
        body: Set(text),
    };
    match new_entity.insert(db).await {
        Ok(created_entity) => created_entity.try_into_model(),
        Err(_e) => Err(DbErr::RecordNotInserted),
    }
}

pub async fn update_title(db: &DbConn, id: i32, title: String) -> Result<article::Model, DbErr> {
    let Some(existing_entity) = get_info(db, id).await? else {
        return Err(DbErr::RecordNotFound("Article not found.".to_owned()));
    };
    let updated_entity = article::ActiveModel {
        id: Unchanged(existing_entity.id),
        folder_id: NotSet,
        entity_type: NotSet,
        title: Set(title),
        body: NotSet,
    };
    updated_entity.update(db).await
}

pub async fn update_folder(db: &DbConn, id: i32, folder_id: i32) -> Result<article::Model, DbErr> {
    let Some(existing_entity) = get_info(db, id).await? else {
        return Err(DbErr::RecordNotFound("Article not found.".to_owned()));
    };
    let updated_entity = article::ActiveModel {
        id: Unchanged(existing_entity.id),
        folder_id: Set(folder_id),
        entity_type: NotSet,
        title: NotSet,
        body: NotSet,
    };
    updated_entity.update(db).await
}

pub async fn update_text(db: &DbConn, id: i32, text: String) -> Result<article::Model, DbErr> {
    let Some(existing_entity) = get_info(db, id).await? else {
        return Err(DbErr::RecordNotFound("Article not found.".to_owned()));
    };
    let updated_entity = article::ActiveModel {
        id: Unchanged(existing_entity.id),
        folder_id: NotSet,
        entity_type: NotSet,
        title: NotSet,
        body: Set(text),
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
    let article = get_by_title(db, title).await?;
    return match article {
        Some(a) => match id {
            Some(id) => Ok(a.id == id),
            None => Ok(false),
        },
        None => Ok(true),
    };
}

pub async fn get(db: &DbConn, id: i32) -> Result<Option<article::Model>, DbErr> {
    ArticleEntity::find_by_id(id).one(db).await
}

pub async fn get_by_title(db: &DbConn, title: &str) -> Result<Option<ArticleInfo>, DbErr> {
    ArticleEntity::find()
        .filter(article::Column::Title.eq(title))
        .into_partial_model::<ArticleInfo>()
        .one(db)
        .await
}

pub async fn get_info(db: &DbConn, id: i32) -> Result<Option<ArticleInfo>, DbErr> {
    ArticleEntity::find_by_id(id)
        .into_partial_model::<ArticleInfo>()
        .one(db)
        .await
}

pub async fn get_text(db: &DbConn, id: i32) -> Result<Option<Article>, DbErr> {
    ArticleEntity::find_by_id(id)
        .into_partial_model::<Article>()
        .one(db)
        .await
}

pub async fn get_all(db: &DbConn) -> Result<Vec<ArticleInfo>, DbErr> {
    ArticleEntity::find()
        .order_by_asc(article::Column::Title)
        .into_partial_model::<ArticleInfo>()
        .all(db)
        .await
}

pub async fn delete(db: &DbConn, id: i32) -> Result<DeleteResult, DbErr> {
    let existing_entity = get(db, id).await?;
    let Some(existing_entity) = existing_entity else {
        return Err(DbErr::RecordNotFound(String::from("Article not found.")));
    };
    existing_entity.delete(db).await
}

pub async fn delete_many(db: &DbConn, ids: Vec<i32>) -> Result<DeleteResult, DbErr> {
    ArticleEntity::delete_many()
        .filter(article::Column::Id.is_in(ids))
        .exec(db)
        .await
}
