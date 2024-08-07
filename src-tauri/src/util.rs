use entity::article::Model;

use crate::schema::article::ArticleSchema;

pub fn generate_article_response<E>(article: &Model, entity_type: Option<String>, entity: E) -> ArticleSchema<E> {
    ArticleSchema {
        id: article.id,
        title: article.title.to_string(),
        entity_type,
        entity,
    }
}