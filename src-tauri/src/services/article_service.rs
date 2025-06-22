use sea_orm::DatabaseConnection;

use ::entity::article::Model as ArticleModel;

use crate::database::article_manager;
use crate::errors::ApiError;
use crate::schema::{
    article::{ArticleInfoSchema, ArticleResponseSchema},
    response::ResponseDiagnosticsSchema,
};
use crate::types::{EntityType, ARTICLE};

pub async fn update_title(
    database: &DatabaseConnection,
    id: i32,
    title: String,
) -> Result<(), ApiError> {
    // Check whether the updated title is unique; if not, then abort the update
    let _title = title.clone();
    let is_unique = article_manager::is_title_unique_for_id(database, Some(id), &title)
        .await
        .map_err(|e| ApiError::query_failed(e, ARTICLE))?;

    if !is_unique {
        return Err(ApiError::field_not_unique(
            ARTICLE,
            Some(id),
            "title".to_owned(),
            _title,
        ));
    }

    return article_manager::update_title(database, id, title)
        .await
        .map(|_| ())
        .map_err(|e| ApiError::field_not_updated(e, ARTICLE, "title".to_owned()));
}

pub async fn update_folder(
    database: &DatabaseConnection,
    id: i32,
    folder_id: i32,
) -> Result<(), ApiError> {
    return article_manager::update_folder(database, id, folder_id)
        .await
        .map(|_| ())
        .map_err(|e| ApiError::field_not_updated(e, ARTICLE, "folder_id".to_owned()));
}

pub async fn update_text(
    database: &DatabaseConnection,
    id: i32,
    text: String,
) -> Result<(), ApiError> {
    return article_manager::update_text(database, id, text)
        .await
        .map(|_| ())
        .map_err(|e| ApiError::field_not_updated(e, ARTICLE, "body".to_owned()));
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
            "title".to_owned(),
            title,
        ));
    }
    return Ok(ResponseDiagnosticsSchema {
        data: is_unique,
        errors,
    });
}

pub async fn get(database: &DatabaseConnection, id: i32) -> Result<ArticleModel, ApiError> {
    let article = article_manager::get(database, id)
        .await
        .map_err(|e| ApiError::not_found(e, ARTICLE))?;
    return match article {
        Some(a) => Ok(a),
        None => return Err(ApiError::not_found("ArticleModel not found.", ARTICLE)),
    };
}

pub async fn get_text(
    database: &DatabaseConnection,
    id: i32,
) -> Result<ArticleResponseSchema, ApiError> {
    let article = article_manager::get_text(database, id)
        .await
        .map_err(|e| ApiError::not_found(e, ARTICLE))?;
    return match article {
        Some(a) => Ok(generate_response(&a)),
        None => return Err(ApiError::not_found("ArticleModel not found.", ARTICLE)),
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
        return Err(ApiError::not_found("ArticleModel not found.", ARTICLE));
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

pub fn generate_insert_response(info: &ArticleModel) -> ArticleInfoSchema {
    return ArticleInfoSchema {
        id: info.id,
        folder_id: info.folder_id,
        title: info.title.to_string(),
        entity_type: EntityType::from(info.entity_type),
    };
}

pub fn generate_info_response(info: &article_manager::ArticleInfo) -> ArticleInfoSchema {
    return ArticleInfoSchema {
        id: info.id,
        folder_id: info.folder_id,
        title: info.title.to_string(),
        entity_type: EntityType::from(info.entity_type),
    };
}

pub fn generate_response(article: &article_manager::Article) -> ArticleResponseSchema {
    ArticleResponseSchema {
        id: article.id,
        folder_id: article.folder_id,
        entity_type: EntityType::from(article.entity_type),
        title: article.title.to_string(),
        body: article.body.to_string(),
    }
}
