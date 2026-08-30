use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct BulkEntityResponseSchema {
    pub entries: Vec<Uuid>,
    pub folders: Vec<Uuid>,
}
