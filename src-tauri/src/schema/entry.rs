use serde::{Deserialize, Serialize};

use crate::types::entity::EntityType;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct EntryCreateSchema<E> {
    pub folder_id: i32,
    pub title: String,
    pub data: E,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct EntryUpdateSchema<E> {
    pub id: i32,
    pub data: E,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct EntryInfoResponseSchema {
    pub id: i32,
    pub folder_id: i32,
    pub entity_type: EntityType,
    pub title: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct EntryPropertyResponseSchema<E> {
    pub info: EntryInfoResponseSchema,
    pub properties: E,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct EntryArticleResponseSchema {
    pub info: EntryInfoResponseSchema,
    pub text: String,
}
