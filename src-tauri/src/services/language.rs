use ::entity::{language, language::Entity as Language};
use sea_orm::*;

pub async fn insert_language(
    db: &DbConn,
    name: &str,
) -> Result<language::Model, DbErr> {
    let new_entity = language::ActiveModel {
        name: Set(name.to_string()),
        ..Default::default()
    };
    let result = new_entity.save(db).await;
    match result {
        Ok(created_entity) => created_entity.try_into_model(),
        Err(_e) => Err(DbErr::RecordNotInserted),
    }
}

pub async fn update_language(
    db: &DbConn,
    id: i32,
    name: &str,
) -> Result<language::Model, DbErr> {
    let result = get_language(db, id).await;
    let existing_entity = match result {
        Ok(entity) => entity,
        Err(_e) => return Err(_e),
    };
    let existing_entity = match existing_entity {
        Some(entity) => entity,
        None => return Err(DbErr::RecordNotFound("Language not found.".to_owned())),
    };
    let updated_entity = language::ActiveModel {
        id: Unchanged(existing_entity.id),
        name: Set(name.to_string()),
    };
    updated_entity.update(db).await
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
    let result = get_language(db, id).await;
    let existing_entity = match result {
        Ok(entity) => entity,
        Err(_e) => return Err(_e),
    };
    let existing_entity = match existing_entity {
        Some(entity) => entity,
        None => return Err(DbErr::RecordNotFound("Language not found.".to_owned())),
    };
    existing_entity.delete(db).await
}