use sea_orm::DatabaseConnection;

use ::entity::article::Model as Article;
use ::entity::person::Model as Person;

use crate::database::{article_manager, person_manager};
use crate::errors::ApiError;
use crate::schema::{
    article::{ArticleResponseSchema, ArticleUpdateSchema},
    person::PersonDataSchema,
    update::UpdateResponseSchema,
};
use crate::services::article_service;
use crate::types::{ARTICLE, PERSON};

pub async fn create(
    database: &DatabaseConnection,
    person: PersonDataSchema,
) -> Result<ArticleResponseSchema<PersonDataSchema>, ApiError> {
    let article = article_manager::insert(&database, &person.name, PERSON)
        .await
        .map_err(|e| ApiError::not_inserted(e, ARTICLE))?;
    return match person_manager::insert(&database, article.id, &person.name).await {
        Ok(entity) => Ok(generate_response(article, entity)),
        Err(e) => Err(ApiError::not_inserted(e, PERSON)),
    };
}

pub async fn update(
    database: &DatabaseConnection,
    article: ArticleUpdateSchema<PersonDataSchema>,
) -> Result<UpdateResponseSchema<()>, ApiError> {
    let mut response = article_service::update(
        &database,
        article.id,
        article.folder_id,
        article.title,
        article.body,
    )
    .await?;

    if article.entity.is_some() {
        let entity = article.entity.unwrap();
        match person_manager::update(database, article.id, &entity.name).await {
            Ok(_) => (),
            Err(e) => response.errors.push(ApiError::not_updated(e, PERSON)),
        }
    }

    return Ok(response);
}

pub async fn get(
    database: &DatabaseConnection,
    id: i32,
) -> Result<ArticleResponseSchema<PersonDataSchema>, ApiError> {
    let article = article_service::get(&database, id).await?;
    let entity = person_manager::get(&database, id)
        .await
        .map_err(|e| ApiError::not_found(e, PERSON))?;
    return match entity {
        Some(entity) => Ok(generate_response(article, entity)),
        None => Err(ApiError::not_found("Person not found.", PERSON)),
    };
}

pub async fn delete(database: &DatabaseConnection, id: i32) -> Result<(), ApiError> {
    let exists = article_manager::exists(&database, id)
        .await
        .map_err(|e| ApiError::query_failed(e, ARTICLE))?;
    if !exists {
        return Err(ApiError::not_found("Person not found.", ARTICLE));
    }
    let _ = article_manager::delete(&database, id)
        .await
        .map_err(|e| ApiError::not_deleted(e, ARTICLE))?;
    person_manager::delete(&database, id)
        .await
        .map_err(|e| ApiError::not_deleted(e, PERSON))?;
    return Ok(());
}

fn generate_response(article: Article, entity: Person) -> ArticleResponseSchema<PersonDataSchema> {
    return article_service::generate_article_response(
        &article,
        PERSON.code(),
        PersonDataSchema { name: entity.name },
    );
}
