use serde::{Deserialize, Serialize};

use super::project::ProjectResponseSchema;

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SessionResponseSchema {
    pub folder_path: Option<String>,
    pub project: Option<ProjectResponseSchema>,
}
