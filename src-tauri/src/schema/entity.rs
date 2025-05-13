use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct EntityUpdateSchema<E> {
    pub id: i32,
    pub data: E,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct EntityResponseSchema<E> {
    pub id: i32,
    pub data: E,
}
