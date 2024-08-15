use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ArticleInfoSchema {
    pub id: i32,
    pub title: String,
    pub entity_type: Option<String>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ArticleSchema<E> {
    pub id: i32,
    pub title: String,
    pub entity_type: Option<String>,
    pub entity: E,
    pub content: String,
}