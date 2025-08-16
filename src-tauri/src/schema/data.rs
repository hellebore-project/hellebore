use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct BulkDataSchema {
    pub entries: Vec<i32>,
    pub folders: Vec<i32>,
}
