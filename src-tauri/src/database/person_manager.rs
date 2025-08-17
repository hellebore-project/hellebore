use sea_orm::*;

use ::entity::{person, person::Entity as Person};

pub async fn insert(db: &DbConn, entry_id: i32, name: &str) -> Result<person::Model, DbErr> {
    let entity = person::ActiveModel {
        id: NotSet,
        entry_id: Set(entry_id),
        name: Set(name.to_string()),
    };
    entity.insert(db).await
}

pub async fn update(db: &DbConn, entry_id: i32, name: &str) -> Result<person::Model, DbErr> {
    let Some(entity) = get(db, entry_id).await? else {
        return Err(DbErr::RecordNotFound("Person not found.".to_owned()));
    };
    let mut entity: person::ActiveModel = entity.into();
    entity.name = Set(name.to_string());
    entity.update(db).await
}

pub async fn get(db: &DbConn, entry_id: i32) -> Result<Option<person::Model>, DbErr> {
    Person::find()
        .filter(person::Column::EntryId.eq(entry_id))
        .one(db)
        .await
}

pub async fn get_all(db: &DbConn) -> Result<Vec<person::Model>, DbErr> {
    Person::find()
        .order_by_asc(person::Column::Id)
        .all(db)
        .await
}
