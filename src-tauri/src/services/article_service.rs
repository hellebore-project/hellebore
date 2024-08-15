use sea_orm::DatabaseConnection;

use crate::schema::article::ArticleInfoSchema;
use crate::database::article_manager;
use crate::errors::ApiError;
use crate::types::ARTICLE;

pub async fn get_all(
    database: &DatabaseConnection
) -> Result<Vec<ArticleInfoSchema>, ApiError> {
    let articles = article_manager::get_all(&database)
        .await
        .map_err(|e| ApiError::not_found(e, ARTICLE))?;
    let articles = articles.iter().map(generate_info_response).collect();
    return Ok(articles);
}

fn generate_info_response(item: &article_manager::ArticleItem) -> ArticleInfoSchema {
    return ArticleInfoSchema {
        id: item.id,
        title: item.title.to_string(),
        entity_type: item.entity_type.clone(),
    }
}