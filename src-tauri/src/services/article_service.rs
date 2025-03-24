use sea_orm::DatabaseConnection;

use crate::database::article_manager;
use crate::errors::ApiError;
use crate::schema::{
    article::{ArticleInfoSchema, ArticleResponseSchema},
    response::ResponseDiagnosticsSchema,
};
use crate::types::{EntityType, ARTICLE};

pub async fn update(
    database: &DatabaseConnection,
    id: i32,
    folder_id: Option<i32>,
    title: Option<String>,
    text: Option<String>,
) -> Result<ResponseDiagnosticsSchema<()>, ApiError> {
    let mut errors: Vec<ApiError> = Vec::new();

    // Check whether the updated title is unique; if not, then do not update the title in the DB
    let mut title = title;
    if title.is_some() {
        let _title = title.clone().unwrap();
        let is_unique = article_manager::is_title_unique_for_id(database, Some(id), &_title).await;
        match is_unique {
            Ok(is_unique) => {
                if !is_unique {
                    errors.push(ApiError::field_not_updated(
                        String::from("Title is not unique."),
                        ARTICLE,
                        String::from("title"),
                    ));
                    errors.push(ApiError::field_not_unique(
                        ARTICLE,
                        Some(id),
                        &String::from("title"),
                        _title,
                    ));
                    title = None;
                }
            }
            Err(e) => return Err(ApiError::query_failed(e, ARTICLE)),
        };
    }

    match article_manager::update(database, id, folder_id, title, text).await {
        Ok(_) => (),
        Err(e) => errors.push(ApiError::not_updated(e, ARTICLE)),
    };

    return Ok(ResponseDiagnosticsSchema { data: (), errors });
}

pub async fn validate_title(
    database: &DatabaseConnection,
    id: Option<i32>,
    title: &str,
) -> Result<ResponseDiagnosticsSchema<bool>, ApiError> {
    let mut errors: Vec<ApiError> = Vec::new();
    let is_unique = article_manager::is_title_unique_for_id(database, id, title)
        .await
        .map_err(|e| ApiError::query_failed(e, ARTICLE))?;
    if !is_unique {
        errors.push(ApiError::field_not_unique(
            ARTICLE,
            id,
            &String::from("title"),
            title,
        ));
    }
    return Ok(ResponseDiagnosticsSchema {
        data: is_unique,
        errors,
    });
}

pub async fn get(
    database: &DatabaseConnection,
    id: i32,
) -> Result<article_manager::Article, ApiError> {
    let article = article_manager::get(database, id)
        .await
        .map_err(|e| ApiError::not_found(e, ARTICLE))?;
    return match article {
        Some(a) => Ok(a),
        None => return Err(ApiError::not_found("Article not found.", ARTICLE)),
    };
}

pub async fn get_all(database: &DatabaseConnection) -> Result<Vec<ArticleInfoSchema>, ApiError> {
    let articles = article_manager::get_all(database)
        .await
        .map_err(|e| ApiError::not_found(e, ARTICLE))?;
    let articles = articles.iter().map(generate_info_response).collect();
    return Ok(articles);
}

pub async fn delete(database: &DatabaseConnection, id: i32) -> Result<(), ApiError> {
    let exists = article_manager::exists(database, id)
        .await
        .map_err(|e| ApiError::query_failed(e, ARTICLE))?;
    if !exists {
        return Err(ApiError::not_found("Article not found.", ARTICLE));
    }
    article_manager::delete(&database, id)
        .await
        .map_err(|e| ApiError::not_deleted(e, ARTICLE))?;
    return Ok(());
}

pub async fn delete_many(database: &DatabaseConnection, ids: Vec<i32>) -> Result<(), ApiError> {
    article_manager::delete_many(database, ids)
        .await
        .map(|_| ())
        .map_err(|e| ApiError::not_deleted(e, ARTICLE))
}

pub fn generate_info_response(info: &article_manager::ArticleInfo) -> ArticleInfoSchema {
    return ArticleInfoSchema {
        id: info.id,
        folder_id: info.folder_id(),
        title: info.title.to_string(),
        entity_type: EntityType::from(info.entity_type),
    };
}

pub fn generate_response<E>(
    article: &article_manager::Article,
    entity: E,
) -> ArticleResponseSchema<E> {
    ArticleResponseSchema {
        id: article.id,
        folder_id: article.folder_id(),
        entity_type: EntityType::from(article.entity_type),
        title: article.title.to_string(),
        entity: Some(entity),
        body: article.body.to_string(),
    }
}
