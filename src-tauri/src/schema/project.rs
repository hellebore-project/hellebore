use sea_orm::DatabaseConnection;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ProjectResponseSchema {
    pub id: i32,
    pub name: String,
}

#[derive(Clone, Debug)]
pub struct ProjectLoadResponseSchema {
    pub info: ProjectResponseSchema,
    pub db: DatabaseConnection,
}
