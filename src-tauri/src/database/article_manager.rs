use ::entity::{article, article::Entity as ArticleEntity};
use sea_orm::*;

use crate::database::folder_manager;
use crate::database::util;
use crate::types::{CodedEnum, EntityType};

#[derive(DerivePartialModel, FromQueryResult)]
#[sea_orm(entity = "ArticleEntity")]
pub struct Article {
    pub id: i32,
    #[sea_orm(from_col = "folder_id")]
    _folder_id: Option<i32>,
    pub entity_type: i8,
    pub title: String,
    pub body: String,
}

impl Article {
    pub fn folder_id(&self) -> i32 {
        folder_manager::convert_null_folder_id_to_sentinel(self._folder_id)
    }
}

#[derive(DerivePartialModel, FromQueryResult)]
#[sea_orm(entity = "ArticleEntity")]
pub struct ArticleInfo {
    pub id: i32,
    #[sea_orm(from_col = "folder_id")]
    pub _folder_id: Option<i32>,
    pub entity_type: i8,
    pub title: String,
}

impl ArticleInfo {
    pub fn folder_id(&self) -> i32 {
        folder_manager::convert_null_folder_id_to_sentinel(self._folder_id)
    }
}

pub async fn insert(
    db: &DbConn,
    folder_id: i32,
    title: &str,
    entity_type: EntityType,
    text: &str,
) -> Result<Article, DbErr> {
    let new_entity = article::ActiveModel {
        id: NotSet,
        folder_id: Set(folder_manager::convert_folder_id_sentinel_to_none(
            folder_id,
        )),
        title: Set(title.to_string()),
        entity_type: Set(entity_type.code()),
        body: Set(text.to_owned()),
    };
    match new_entity.insert(db).await {
        Ok(created_entity) => Ok(Article {
            id: created_entity.id,
            _folder_id: created_entity.folder_id,
            entity_type: created_entity.entity_type,
            title: created_entity.title,
            body: created_entity.body,
        }),
        Err(_e) => Err(DbErr::RecordNotInserted),
    }
}

pub async fn update(
    db: &DbConn,
    id: i32,
    folder_id: Option<i32>,
    title: Option<String>,
    content: Option<String>,
) -> Result<article::Model, DbErr> {
    let Some(existing_entity) = get(db, id).await? else {
        return Err(DbErr::RecordNotFound("Article not found.".to_owned()));
    };
    let updated_entity = article::ActiveModel {
        id: Unchanged(existing_entity.id),
        folder_id: folder_manager::convert_optional_folder_id_to_active_value(folder_id),
        entity_type: NotSet,
        title: util::set_value_or_null(title),
        body: util::set_value_or_null(content),
    };
    updated_entity.update(db).await
}

pub async fn exists(db: &DbConn, id: i32) -> Result<bool, DbErr> {
    return Ok(get(db, id).await?.is_some());
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

pub async fn get(db: &DbConn, id: i32) -> Result<Option<Article>, DbErr> {
    ArticleEntity::find_by_id(id)
        .into_partial_model::<Article>()
        .one(db)
        .await
}

pub async fn get_by_title(db: &DbConn, title: &str) -> Result<Option<Article>, DbErr> {
    ArticleEntity::find()
        .filter(article::Column::Title.eq(title))
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
    let existing_entity = ArticleEntity::find_by_id(id).one(db).await?;
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
