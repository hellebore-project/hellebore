use sea_orm::entity::{ActiveValue, Value};

use entity::article::Model;

use crate::schema::article::ArticleResponseSchema;

pub fn generate_article_response<E>(
    article: &Model,
    entity_type: i8,
    entity: E,
) -> ArticleResponseSchema<E> {
    ArticleResponseSchema {
        id: article.id,
        folder_id: article.folder_id,
        entity_type,
        title: article.title.to_string(),
        entity: Some(entity),
        body: article.body.to_string(),
    }
}

pub fn optional_value_to_active_value<V>(string: Option<V>) -> ActiveValue<V>
where
    V: Into<Value>,
{
    match string {
        Some(s) => ActiveValue::Set(s),
        None => ActiveValue::NotSet,
    }
}
