use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FolderCreateSchema {
    pub parent_id: Uuid,
    pub name: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FolderUpdateSchema {
    pub id: Uuid,
    pub parent_id: Option<Uuid>,
    pub name: Option<String>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FolderUpdateResponseSchema {
    pub id: Uuid,
    pub parent_changed: bool,
    pub name_changed: bool,
}

impl FolderUpdateResponseSchema {
    pub fn new(folder: &FolderUpdateSchema) -> Self {
        Self {
            id: folder.id,
            parent_changed: folder.parent_id.is_some(),
            name_changed: folder.name.is_some(),
        }
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FolderNameCollisionSchema {
    pub is_unique: bool,
    pub colliding_folder: FolderResponseSchema,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FolderValidationSchema {
    pub id: Option<Uuid>,
    pub parent_id: Uuid,
    pub name: String,
    pub name_collision: Option<FolderNameCollisionSchema>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FolderResponseSchema {
    pub id: Uuid,
    pub parent_id: Uuid,
    pub name: String,
}
