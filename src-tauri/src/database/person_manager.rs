use sea_orm::*;
use uuid::Uuid;

use ::entity::{person, person::Entity as Person};

pub async fn insert<C>(con: &C, entry_id: Uuid, name: &str) -> Result<person::Model, DbErr>
where
    C: ConnectionTrait,
{
    let person = person::ActiveModel {
        id: Set(Uuid::new_v4()),
        entry_id: Set(entry_id),
        name: Set(name.to_string()),
    };
    person.insert(con).await
}

pub async fn update<C>(con: &C, entry_id: Uuid, name: &str) -> Result<person::Model, DbErr>
where
    C: ConnectionTrait,
{
    let Some(entity) = get(con, entry_id).await? else {
        return Err(DbErr::RecordNotFound("Person not found.".to_owned()));
    };
    let mut entity: person::ActiveModel = entity.into();
    entity.name = Set(name.to_string());
    entity.update(con).await
}

pub async fn get<C>(con: &C, entry_id: Uuid) -> Result<Option<person::Model>, DbErr>
where
    C: ConnectionTrait,
{
    Person::find()
        .filter(person::Column::EntryId.eq(entry_id))
        .one(con)
        .await
}

pub async fn get_all<C>(con: &C) -> Result<Vec<person::Model>, DbErr>
where
    C: ConnectionTrait,
{
    Person::find()
        .order_by_asc(person::Column::Id)
        .all(con)
        .await
}
