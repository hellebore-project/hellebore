use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct FolderCreateSchema {
    pub parent_id: i32,
    pub name: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct FolderUpdateSchema {
    pub id: i32,
    pub parent_id: Option<i32>,
    pub name: Option<String>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct FolderResponseSchema {
    pub id: i32,
    pub parent_id: i32,
    pub name: String,
}
