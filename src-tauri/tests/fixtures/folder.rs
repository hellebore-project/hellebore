use rstest::*;
use uuid::Uuid;

use hellebore::schema::folder::FolderCreateSchema;

#[fixture]
pub fn folder_id() -> Uuid {
    Uuid::nil()
}

#[fixture]
pub fn parent_folder_id() -> Uuid {
    Uuid::nil()
}

#[fixture]
pub fn folder_name() -> String {
    "folder".to_owned()
}

#[fixture]
pub fn folder_create_payload(parent_folder_id: Uuid, folder_name: String) -> FolderCreateSchema {
    FolderCreateSchema {
        parent_id: parent_folder_id,
        name: folder_name,
    }
}
