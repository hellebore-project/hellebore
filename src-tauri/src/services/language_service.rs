use sea_orm::DatabaseConnection;

use ::entity::article::Model;

use crate::schema::article::ArticleSchema;
use crate::schema::language::{IdentifiedLanguageSchema, LanguageDataSchema};
use crate::database::article_manager;
use crate::database::language_manager;
use crate::errors::ApiError;
use crate::types::{ARTICLE, LANGUAGE};
use crate::util;

pub async fn create(
    database: &DatabaseConnection, language: LanguageDataSchema
) -> Result<ArticleSchema<IdentifiedLanguageSchema>, ApiError> {
    let article = article_manager::insert(&database, &language.name, LANGUAGE)
        .await
        .map_err(|e| ApiError::not_inserted(e, ARTICLE))?;
    return match language_manager::insert(&database, article.id).await {
        Ok(_) => Ok(generate_response(article)),
        Err(e) => Err(ApiError::not_inserted(e, LANGUAGE)),
    };
}

pub async fn update(
    database: &DatabaseConnection,
    article: ArticleSchema<LanguageDataSchema>
) -> Result<ArticleSchema<IdentifiedLanguageSchema>, ApiError> {
    return article_manager::update(&database, article.id, &article.title, &article.content)
        .await
        .map(|a| generate_response(a))
        .map_err(|e| ApiError::not_updated(e, ARTICLE));
}

pub async fn get(
    database: &DatabaseConnection, id: i32
) -> Result<ArticleSchema<IdentifiedLanguageSchema>, ApiError> {
    let article = article_manager::get(&database, id)
        .await
        .map_err(|e| ApiError::not_found(e, ARTICLE))?;
    return match article {
        Some(a) => Ok(generate_response(a)),
        None => return Err(ApiError::not_found("Language not found.", ARTICLE))
    };
}

pub async fn delete(database: &DatabaseConnection, id: i32) -> Result<(), ApiError> {
    let exists = article_manager::exists(&database, id)
        .await
        .map_err(|e| ApiError::query_failed(e, ARTICLE))?;
    if !exists {
        return Err(ApiError::not_found("Language not found.", ARTICLE));
    }
    let _ = article_manager::delete(&database, id)
        .await
        .map_err(|e| ApiError::not_deleted(e, ARTICLE))?;
    language_manager::delete(&database, id).await.map_err(|e| ApiError::not_deleted(e, LANGUAGE))?;
    return Ok(());
}

fn generate_response(article: Model) -> ArticleSchema<IdentifiedLanguageSchema> {
    return util::generate_article_response(
        &article,
        Some(LANGUAGE.name()),
        IdentifiedLanguageSchema {
            id: article.id,
            data: LanguageDataSchema { name: article.title.to_string() },
        },
    );
}