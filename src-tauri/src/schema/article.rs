use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ArticleInfoSchema {
    pub id: i32,
    pub entity_type: i8,
    pub title: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ArticleUpdateSchema<E> {
    pub id: i32,
    pub entity_type: i8,
    pub title: Option<String>,
    pub entity: Option<E>,
    pub body: Option<String>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ArticleResponseSchema<E> {
    pub id: i32,
    pub entity_type: i8,
    pub title: String,
    pub entity: Option<E>,
    pub body: String,
}