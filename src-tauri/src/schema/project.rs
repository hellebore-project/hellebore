use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProjectResponseSchema {
    pub id: Uuid,
    pub name: String,
}

#[derive(serde::Serialize, serde::Deserialize)]
pub struct ProjectConfigFileSchema {
    #[serde(default)]
    pub name: String,
}
