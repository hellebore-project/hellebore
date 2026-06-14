use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProjectResponseSchema {
    pub id: String,
    pub name: String,
}

#[derive(serde::Serialize, serde::Deserialize)]
pub struct ProjectConfigFileSchema {
    #[serde(default)]
    pub name: String,
}
