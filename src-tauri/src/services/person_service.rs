use sea_orm::DatabaseConnection;

use ::entity::person::Model as Person;

use crate::database::{article_manager, person_manager};
use crate::errors::ApiError;
use crate::schema::entity::{EntityResponseSchema, EntityUpdateSchema};
use crate::schema::{
    article::{ArticleCreateSchema, ArticleInfoSchema},
    person::PersonDataSchema,
};
use crate::services::article_service;
use crate::types::{ARTICLE, PERSON};

pub async fn create(
    database: &DatabaseConnection,
    article: ArticleCreateSchema<PersonDataSchema>,
) -> Result<ArticleInfoSchema, ApiError> {
    let _article = article_manager::insert(
        &database,
        article.folder_id,
        article.title.to_owned(),
        PERSON,
        "".to_owned(),
    )
    .await
    .map_err(|e| ApiError::not_inserted(e, ARTICLE))?;

    person_manager::insert(&database, _article.id, &article.data.name)
        .await
        .map_err(|e| ApiError::not_inserted(e, PERSON))?;

    Ok(article_service::generate_insert_response(&_article))
}

pub async fn update(
    database: &DatabaseConnection,
    entity: EntityUpdateSchema<PersonDataSchema>,
) -> Result<(), ApiError> {
    person_manager::update(database, entity.id, &entity.data.name)
        .await
        .map(|_| ())
        .map_err(|e| ApiError::not_updated(e, PERSON))
}

pub async fn get(
    database: &DatabaseConnection,
    id: i32,
) -> Result<EntityResponseSchema<PersonDataSchema>, ApiError> {
    let entity = person_manager::get(&database, id)
        .await
        .map_err(|e| ApiError::not_found(e, PERSON))?;
    return match entity {
        Some(entity) => Ok(generate_response(entity)),
        None => Err(ApiError::not_found("Person not found.", PERSON)),
    };
}

pub async fn delete(database: &DatabaseConnection, id: i32) -> Result<(), ApiError> {
    article_service::delete(&database, id).await?;
    person_manager::delete(&database, id)
        .await
        .map_err(|e| ApiError::not_deleted(e, PERSON))?;
    return Ok(());
}

fn generate_response(entity: Person) -> EntityResponseSchema<PersonDataSchema> {
    EntityResponseSchema {
        id: entity.id,
        data: PersonDataSchema { name: entity.name },
    }
}
