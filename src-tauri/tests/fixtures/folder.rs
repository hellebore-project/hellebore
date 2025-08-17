use rstest::*;

use hellebore::schema::folder::FolderCreateSchema;

#[fixture]
pub fn folder_id() -> i32 {
    return -1;
}

#[fixture]
pub fn parent_folder_id() -> i32 {
    return -1;
}

#[fixture]
pub fn folder_name() -> String {
    return "folder".to_owned();
}

#[fixture]
pub fn folder_create_payload(parent_folder_id: i32, folder_name: String) -> FolderCreateSchema {
    FolderCreateSchema {
        parent_id: parent_folder_id,
        name: folder_name,
    }
}
