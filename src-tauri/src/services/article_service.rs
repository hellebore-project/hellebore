use sea_orm::DatabaseConnection;

use ::entity::article::Model as Article;

use crate::database::{article_manager, folder_manager};
use crate::errors::ApiError;
use crate::schema::{
    article::{ArticleInfoSchema, ArticleResponseSchema},
    response::ResponseSchema,
};
use crate::types::ARTICLE;

pub async fn update(
    database: &DatabaseConnection,
    id: i32,
    folder_id: Option<i32>,
    title: Option<String>,
    body: Option<String>,
) -> Result<ResponseSchema<()>, ApiError> {
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

    match article_manager::update(&database, id, folder_id, title, body).await {
        Ok(_) => (),
        Err(e) => errors.push(ApiError::not_updated(e, ARTICLE)),
    };

    return Ok(ResponseSchema { data: (), errors });
}

pub async fn validate_title(
    database: &DatabaseConnection,
    id: Option<i32>,
    title: &str,
) -> Result<ResponseSchema<bool>, ApiError> {
    let mut errors: Vec<ApiError> = Vec::new();
    let is_unique = article_manager::is_title_unique_for_id(&database, id, title)
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
    return Ok(ResponseSchema {
        data: is_unique,
        errors,
    });
}

pub async fn get(database: &DatabaseConnection, id: i32) -> Result<Article, ApiError> {
    let article = article_manager::get(&database, id)
        .await
        .map_err(|e| ApiError::not_found(e, ARTICLE))?;
    return match article {
        Some(a) => Ok(a),
        None => return Err(ApiError::not_found("Article not found.", ARTICLE)),
    };
}

pub async fn get_all(database: &DatabaseConnection) -> Result<Vec<ArticleInfoSchema>, ApiError> {
    let articles = article_manager::get_all(&database)
        .await
        .map_err(|e| ApiError::not_found(e, ARTICLE))?;
    let articles = articles.iter().map(generate_info_response).collect();
    return Ok(articles);
}

pub async fn delete(database: &DatabaseConnection, id: i32) -> Result<(), ApiError> {
    let exists = article_manager::exists(&database, id)
        .await
        .map_err(|e| ApiError::query_failed(e, ARTICLE))?;
    if !exists {
        return Err(ApiError::not_found("Person not found.", ARTICLE));
    }
    article_manager::delete(&database, id)
        .await
        .map_err(|e| ApiError::not_deleted(e, ARTICLE))?;
    return Ok(());
}

fn generate_info_response(item: &article_manager::ArticleItem) -> ArticleInfoSchema {
    return ArticleInfoSchema {
        id: item.id,
        folder_id: folder_manager::convert_null_folder_id_to_sentinel(item.folder_id),
        title: item.title.to_string(),
        entity_type: item.entity_type,
    };
}

pub fn generate_article_response<E>(
    article: &Article,
    entity_type: i8,
    entity: E,
) -> ArticleResponseSchema<E> {
    ArticleResponseSchema {
        id: article.id,
        folder_id: folder_manager::convert_null_folder_id_to_sentinel(article.folder_id),
        entity_type,
        title: article.title.to_string(),
        entity: Some(entity),
        body: article.body.to_string(),
    }
}
