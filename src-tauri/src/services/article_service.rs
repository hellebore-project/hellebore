use sea_orm::DatabaseConnection;

use crate::database::article_manager;
use crate::schema::{
    article::ArticleInfoSchema,
    update::UpdateResponseSchema,
};
use crate::errors::ApiError;
use crate::types::ARTICLE;

pub async fn update(
    database: &DatabaseConnection,
    id: i32,
    title: Option<String>,
    body: Option<String>
) -> Result<
        UpdateResponseSchema<()>, 
        ApiError
    > {
    let mut errors: Vec<ApiError> = Vec::new();

    // Check whether the updated title is unique; if not, then do not update the title in the DB
    let mut title = title;
    if title.is_some() {
        let is_unique = article_manager::is_title_unique_for_id(
            database, id, 
            &title.clone().unwrap()
        ).await;
        match is_unique {
            Ok(is_unique) => {
                if !is_unique {
                    title = None;
                    errors.push(
                        ApiError::field_not_updated(
                            String::from("Title is not unique."), 
                            ARTICLE, 
                            String::from("title")
                        )
                    );
                }
            },
            Err(e) => return Err(ApiError::query_failed(e, ARTICLE))
        };
    }

    match article_manager::update(&database, id, title, body).await {
        Ok(_) => (),
        Err(e) => errors.push(ApiError::not_updated(e, ARTICLE))
    };

    return Ok(
        UpdateResponseSchema {
            data: (),
            errors,
        }
    );
}

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
        entity_type: item.entity_type,
    }
}