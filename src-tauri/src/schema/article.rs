use serde::{Deserialize, Serialize};

use crate::types::EntityType;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ArticleInfoSchema {
    pub id: i32,
    pub folder_id: i32,
    pub entity_type: EntityType,
    pub title: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ArticleCreateSchema<E> {
    pub folder_id: i32,
    pub title: String,
    pub data: E,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ArticleResponseSchema {
    pub id: i32,
    pub folder_id: i32,
    pub entity_type: EntityType,
    pub title: String,
    pub body: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ArticlePropertiesResponseSchema<E> {
    pub id: i32,
    pub folder_id: i32,
    pub entity_type: EntityType,
    pub title: String,
    pub entity: Option<E>,
}
