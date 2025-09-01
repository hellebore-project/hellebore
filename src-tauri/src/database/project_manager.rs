use ::entity::{project, project::Entity as Project};
use sea_orm::*;

pub async fn insert<C>(con: &C, name: &str) -> Result<project::Model, DbErr>
where
    C: ConnectionTrait,
{
    let new_entity = project::ActiveModel {
        id: NotSet,
        name: Set(name.to_string()),
    };
    match new_entity.insert(con).await {
        Ok(created_entity) => created_entity.try_into_model(),
        Err(_e) => Err(DbErr::RecordNotInserted),
    }
}

pub async fn update<C>(con: &C, id: i32, name: &str) -> Result<project::Model, DbErr>
where
    C: ConnectionTrait,
{
    let Some(existing_entity) = get(con, id).await? else {
        return Err(DbErr::RecordNotFound("Project not found.".to_owned()));
    };
    let updated_entity = project::ActiveModel {
        id: Unchanged(existing_entity.id),
        name: Set(name.to_string()),
    };
    updated_entity.update(con).await
}

pub async fn get<C>(con: &C, id: i32) -> Result<Option<project::Model>, DbErr>
where
    C: ConnectionTrait,
{
    Project::find_by_id(id).one(con).await
}

pub async fn get_all<C>(con: &C) -> Result<Vec<project::Model>, DbErr>
where
    C: ConnectionTrait,
{
    Project::find().all(con).await
}

pub async fn delete<C>(con: &C, id: i32) -> Result<DeleteResult, DbErr>
where
    C: ConnectionTrait,
{
    let Some(existing_entity) = get(con, id).await? else {
        return Err(DbErr::RecordNotFound(String::from("Project not found.")));
    };
    existing_entity.delete(con).await
}
