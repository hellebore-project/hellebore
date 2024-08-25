use sea_orm::*;

use ::entity::{person, person::Entity as Person};

use crate::util;

pub async fn insert(
    db: &DbConn,
    id: i32,
    name: &str,
) -> Result<person::Model, DbErr> {
    let new_entity = person::ActiveModel { 
        id: Set(id),
        name: Set(name.to_string())
    };
    return new_entity.insert(db).await;
}

pub async fn update(
    db: &DbConn,
    id: i32,
    name: &str
) -> Result<person::Model, DbErr> {
    let Some(existing_entity) = get(db, id).await?
    else {
        return Err(DbErr::RecordNotFound("Person not found.".to_owned()));
    };
    let updated_entity = person::ActiveModel {
        id: Unchanged(existing_entity.id),
        name: Set(name.to_string()),
    };
    updated_entity.update(db).await
}

pub async fn get(db: &DbConn, id: i32) -> Result<Option<person::Model>, DbErr> {
    Person::find_by_id(id)
        .one(db)
        .await
}

pub async fn get_all(db: &DbConn) -> Result<Vec<person::Model>, DbErr> {
    Person::find()
        .order_by_asc(person::Column::Id)
        .all(db)
        .await
}

pub async fn delete(db: &DbConn, id: i32) -> Result<DeleteResult, DbErr> {
    let Some(existing_entity) = get(db, id).await? else {
        return Err(DbErr::RecordNotFound("Person not found.".to_owned()));
    };
    return existing_entity.delete(db).await;
}