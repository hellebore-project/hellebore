use sea_orm::*;

use ::entity::{language, language::Entity as Language};

pub async fn insert(
    db: &DbConn,
    id: i32,
) -> Result<language::Model, DbErr> {
    let new_entity = language::ActiveModel { id: Set(id) };
    return new_entity.insert(db).await;
}

pub async fn get(db: &DbConn, id: i32) -> Result<Option<language::Model>, DbErr> {
    Language::find_by_id(id)
        .one(db)
        .await
}

pub async fn get_all(db: &DbConn) -> Result<Vec<language::Model>, DbErr> {
    Language::find()
        .order_by_asc(language::Column::Id)
        .all(db)
        .await
}

pub async fn delete(db: &DbConn, id: i32) -> Result<DeleteResult, DbErr> {
    let Some(existing_entity) = get(db, id).await? else {
        return Err(DbErr::RecordNotFound("Language not found.".to_owned()));
    };
    return existing_entity.delete(db).await;
}