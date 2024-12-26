use ::entity::{article, article::Entity as Article};
use sea_orm::*;

use crate::database::folder_manager;
use crate::database::util;
use crate::types::EntityType;

#[derive(FromQueryResult)]
pub struct ArticleItem {
    pub id: i32,
    pub folder_id: Option<i32>,
    pub entity_type: i8,
    pub title: String,
}

pub async fn insert(
    db: &DbConn,
    folder_id: i32,
    title: &str,
    entity_type: EntityType,
) -> Result<article::Model, DbErr> {
    let new_entity = article::ActiveModel {
        id: NotSet,
        folder_id: Set(folder_manager::convert_folder_id_sentinel_to_none(
            folder_id,
        )),
        title: Set(title.to_string()),
        entity_type: Set(entity_type.code()),
        body: Set(String::from("")),
    };
    match new_entity.insert(db).await {
        Ok(created_entity) => created_entity.try_into_model(),
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
        folder_id: folder_manager::optional_folder_id_to_active_value(folder_id),
        entity_type: NotSet,
        title: util::optional_value_to_active_value(title),
        body: util::optional_value_to_active_value(content),
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

pub async fn get(db: &DbConn, id: i32) -> Result<Option<article::Model>, DbErr> {
    Article::find_by_id(id).one(db).await
}

pub async fn get_by_title(db: &DbConn, title: &str) -> Result<Option<article::Model>, DbErr> {
    Article::find()
        .filter(article::Column::Title.eq(title))
        .one(db)
        .await
}

pub async fn get_all(db: &DbConn) -> Result<Vec<ArticleItem>, DbErr> {
    Article::find()
        .select_only()
        .columns([
            article::Column::Id,
            article::Column::FolderId,
            article::Column::Title,
            article::Column::EntityType,
        ])
        .order_by_asc(article::Column::Title)
        .into_model::<ArticleItem>()
        .all(db)
        .await
}

pub async fn delete(db: &DbConn, id: i32) -> Result<DeleteResult, DbErr> {
    let Some(existing_entity) = get(db, id).await? else {
        return Err(DbErr::RecordNotFound(String::from("Article not found.")));
    };
    existing_entity.delete(db).await
}
