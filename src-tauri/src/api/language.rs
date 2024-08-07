use ::entity::article::Model;

use crate::app::AppState;
use crate::schema::article::ArticleSchema;
use crate::schema::language::{IdentifiedLanguageSchema, LanguageDataSchema};
use crate::services::article as article_manager;
use crate::services::language as language_manager;
use crate::api::errors::ApiError;
use crate::types::{ARTICLE, LANGUAGE};
use crate::util;

#[tauri::command]
pub async fn create_language(
    state: tauri::State<'_, AppState>, language: LanguageDataSchema
) -> Result<ArticleSchema<IdentifiedLanguageSchema>, ApiError> {
    let article = article_manager::insert(&state.database, &language.name, LANGUAGE)
        .await
        .map_err(|e| ApiError::not_inserted(e, ARTICLE))?;
    return match language_manager::insert(&state.database, article.id).await {
        Ok(_) => Ok(generate_response(article)),
        Err(e) => Err(ApiError::not_inserted(e, LANGUAGE)),
    };
}

#[tauri::command]
pub async fn update_language(
    state: tauri::State<'_, AppState>,
    article: ArticleSchema<LanguageDataSchema>
) -> Result<ArticleSchema<IdentifiedLanguageSchema>, ApiError> {
    return article_manager::update(&state.database, article.id, &article.title)
        .await
        .map(|a| generate_response(a))
        .map_err(|e| ApiError::not_updated(e, ARTICLE));
}

#[tauri::command]
pub async fn get_language(
    state: tauri::State<'_, AppState>, id: i32
) -> Result<ArticleSchema<IdentifiedLanguageSchema>, ApiError> {
    let article = article_manager::get(&state.database, id)
        .await
        .map_err(|e| ApiError::not_found(e, ARTICLE))?;
    return match article {
        Some(a) => Ok(generate_response(a)),
        None => return Err(ApiError::not_found("Language not found.", ARTICLE))
    };
}

#[tauri::command]
pub async fn delete_language(state: tauri::State<'_, AppState>, id: i32) -> Result<(), ApiError> {
    let exists = article_manager::exists(&state.database, id)
        .await
        .map_err(|e| ApiError::query_failed(e, ARTICLE))?;
    if !exists {
        return Err(ApiError::not_found("Language not found.", ARTICLE));
    }
    let _ = article_manager::delete(&state.database, id)
        .await
        .map_err(|e| ApiError::not_deleted(e, ARTICLE))?;
    language_manager::delete(&state.database, id).await.map_err(|e| ApiError::not_deleted(e, LANGUAGE))?;
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