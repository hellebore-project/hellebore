use ::entity::{language, language::Entity as Language};
use sea_orm::*;

pub async fn insert_language(
    db: &DbConn,
    name: &str,
) -> Result<language::Model, DbErr> {
    language::ActiveModel {
        name: Set(name.to_string()),
        ..Default::default()
    }
        .save(db)
        .await
        .expect("Failed to insert a new language")
        .try_into_model()
}

pub async fn update_language(
    db: &DbConn,
    id: i32,
    name: &str,
) -> Result<language::Model, DbErr> {
    let language: language::ActiveModel = get_language(db, id).await?
        .ok_or(DbErr::RecordNotFound("Language not found.".to_owned()))
        .map(Into::into)?;

    language::ActiveModel {
        id: language.id,
        name: Set(name.to_string()),
    }
    .update(db)
    .await
}

pub async fn get_language(db: &DbConn, id: i32) -> Result<Option<language::Model>, DbErr> {
    Language::find_by_id(id)
        .one(db)
        .await
}

pub async fn get_languages(db: &DbConn) -> Result<Vec<language::Model>, DbErr> {
    Language::find()
        .order_by_asc(language::Column::Id)
        .all(db)
        .await
}

pub async fn delete_language(db: &DbConn, id: i32) -> Result<DeleteResult, DbErr> {
    let language: language::ActiveModel = get_language(db, id).await?
        .ok_or(DbErr::RecordNotFound("Language not found.".to_owned()))
        .map(Into::into)?;

    language.delete(db).await
}