use sea_orm::DatabaseConnection;

use crate::database::{article_manager, language_manager, word_manager};
use crate::errors::ApiError;
use crate::schema::{
    article::{ArticleCreateSchema, ArticleInfoSchema},
    language::LanguageDataSchema,
};
use crate::services::article_service;
use crate::types::{ARTICLE, LANGUAGE};

pub async fn create(
    database: &DatabaseConnection,
    article: ArticleCreateSchema<LanguageDataSchema>,
) -> Result<ArticleInfoSchema, ApiError> {
    let article = article_manager::insert(
        &database,
        article.folder_id,
        article.title.to_owned(),
        LANGUAGE,
        "".to_owned(),
    )
    .await
    .map_err(|e| ApiError::not_inserted(e, ARTICLE))?;
    return match language_manager::insert(&database, article.id).await {
        Ok(_) => Ok(article_service::generate_insert_response(&article)),
        Err(e) => Err(ApiError::not_inserted(e, LANGUAGE)),
    };
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
