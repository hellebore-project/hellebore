use sea_orm::DatabaseConnection;

use ::entity::article::Model as Article;

use crate::database::{article_manager, language_manager};
use crate::errors::ApiError;
use crate::schema::{
    article::{ArticleResponseSchema, ArticleUpdateSchema},
    language::{IdentifiedLanguageSchema, LanguageDataSchema},
    update::UpdateResponseSchema,
};
use crate::services::article_service;
use crate::types::{ARTICLE, LANGUAGE};
use crate::util;

pub async fn create(
    database: &DatabaseConnection, language: LanguageDataSchema
) -> Result<ArticleResponseSchema<IdentifiedLanguageSchema>, ApiError> {
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
    article: ArticleUpdateSchema<LanguageDataSchema>
) -> Result<UpdateResponseSchema<()>, ApiError> {
    return article_service::update(
        &database,
        article.id,
        article.title,
        article.body
    ).await;
}

pub async fn get(
    database: &DatabaseConnection, id: i32
) -> Result<ArticleResponseSchema<IdentifiedLanguageSchema>, ApiError> {
    return article_service::get(&database, id)
        .await
        .map(|a| generate_response(a));
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

fn generate_response(article: Article) -> ArticleResponseSchema<IdentifiedLanguageSchema> {
    return util::generate_article_response(
        &article,
        LANGUAGE.code(),
        IdentifiedLanguageSchema {
            id: article.id,
            data: LanguageDataSchema { name: article.title.to_string() },
        },
    );
}