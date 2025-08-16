use serde::{Deserialize, Serialize};

use crate::types::EntityType;

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
pub struct EntryInfoSchema {
    pub id: i32,
    pub folder_id: i32,
    pub entity_type: EntityType,
    pub title: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct EntryDataResponseSchema<E> {
    pub id: i32,
    pub data: E,
}
