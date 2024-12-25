use ::entity::{project, project::Entity as Project};
use sea_orm::*;

pub async fn insert(db: &DbConn, name: &str) -> Result<project::Model, DbErr> {
    let new_entity = project::ActiveModel {
        id: NotSet,
        name: Set(name.to_string()),
    };
    match new_entity.insert(db).await {
        Ok(created_entity) => created_entity.try_into_model(),
        Err(_e) => Err(DbErr::RecordNotInserted),
    }
}

pub async fn update(db: &DbConn, id: i32, name: &str) -> Result<project::Model, DbErr> {
    let Some(existing_entity) = get(db, id).await? else {
        return Err(DbErr::RecordNotFound("Project not found.".to_owned()));
    };
    let updated_entity = project::ActiveModel {
        id: Unchanged(existing_entity.id),
        name: Set(name.to_string()),
    };
    updated_entity.update(db).await
}

pub async fn get(db: &DbConn, id: i32) -> Result<Option<project::Model>, DbErr> {
    Project::find_by_id(id).one(db).await
}

pub async fn get_all(db: &DbConn) -> Result<Vec<project::Model>, DbErr> {
    Project::find().all(db).await
}

pub async fn delete(db: &DbConn, id: i32) -> Result<DeleteResult, DbErr> {
    let Some(existing_entity) = get(db, id).await? else {
        return Err(DbErr::RecordNotFound(String::from("Project not found.")));
    };
    existing_entity.delete(db).await
}
