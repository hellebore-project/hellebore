use sea_orm::entity::ActiveValue;

use entity::article::Model;

use crate::schema::article::ArticleResponseSchema;

pub fn generate_article_response<E>(
    article: &Model,
    entity_type: i8,
    entity: E,
) -> ArticleResponseSchema<E> {
    ArticleResponseSchema {
        id: article.id,
        entity_type,
        title: article.title.to_string(),
        entity: Some(entity),
        body: article.body.to_string(),
    }
}

pub fn optional_string_to_active_value(string: Option<String>) -> ActiveValue<String> {
    match string {
        Some(s) => ActiveValue::Set(s),
        None => ActiveValue::NotSet,
    }
}
