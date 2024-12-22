use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ProjectResponseSchema {
    pub id: i32,
    pub name: String,
}
