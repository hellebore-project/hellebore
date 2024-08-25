use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct PersonDataSchema {
    pub name: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct IdentifiedPersonSchema {
    pub id: i32,
    pub data: PersonDataSchema,
}
