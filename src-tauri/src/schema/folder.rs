use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct FolderInfoSchema {
    pub parent_id: i32,
    pub name: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct FolderSchema {
    pub id: i32,
    pub info: FolderInfoSchema,
}
