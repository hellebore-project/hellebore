use sea_orm::DatabaseConnection;

use ::entity::article::Model as Article;

use crate::database::{article_manager, language_manager, word_manager};
use crate::errors::ApiError;
use crate::schema::{
    article::{ArticleCreateSchema, ArticleResponseSchema, ArticleUpdateSchema},
    language::LanguageDataSchema,
    response::ResponseDiagnosticsSchema,
};
use crate::services::article_service;
use crate::types::{ARTICLE, LANGUAGE};

pub async fn create(
    database: &DatabaseConnection,
    article: ArticleCreateSchema<LanguageDataSchema>,
) -> Result<ArticleResponseSchema<LanguageDataSchema>, ApiError> {
    let article =
        article_manager::insert(&database, article.folder_id, &article.title, LANGUAGE, "")
            .await
            .map_err(|e| ApiError::not_inserted(e, ARTICLE))?;
    return match language_manager::insert(&database, article.id).await {
        Ok(_) => Ok(generate_response(article)),
        Err(e) => Err(ApiError::not_inserted(e, LANGUAGE)),
    };
}

pub async fn update(
    database: &DatabaseConnection,
    article: ArticleUpdateSchema<LanguageDataSchema>,
) -> Result<ResponseDiagnosticsSchema<()>, ApiError> {
    return article_service::update(
        &database,
        article.id,
        article.folder_id,
        article.title,
        article.body,
    )
    .await;
}

pub async fn get(
    database: &DatabaseConnection,
    id: i32,
) -> Result<ArticleResponseSchema<LanguageDataSchema>, ApiError> {
    return article_service::get(&database, id)
        .await
        .map(|a| generate_response(a));
}

pub async fn delete(database: &DatabaseConnection, id: i32) -> Result<(), ApiError> {
    article_service::delete(&database, id).await?;
    language_manager::delete(&database, id)
        .await
        .map_err(|e| ApiError::not_deleted(e, LANGUAGE))?;
    word_manager::delete_all(&database, id)
        .await
        .map_err(|e| ApiError::not_deleted(e, LANGUAGE))?;
    return Ok(());
}

fn generate_response(article: Article) -> ArticleResponseSchema<LanguageDataSchema> {
    return article_service::generate_article_response(
        &article,
        LANGUAGE,
        LanguageDataSchema {
            name: article.title.to_string(),
        },
    );
}
