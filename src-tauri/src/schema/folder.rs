use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FolderCreateSchema {
    pub parent_id: i32,
    pub name: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FolderUpdateSchema {
    pub id: i32,
    pub parent_id: Option<i32>,
    pub name: Option<String>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FolderUpdateResponseSchema {
    pub id: i32,
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
    pub id: Option<i32>,
    pub parent_id: i32,
    pub name: String,
    pub name_collision: Option<FolderNameCollisionSchema>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FolderResponseSchema {
    pub id: i32,
    pub parent_id: i32,
    pub name: String,
}
