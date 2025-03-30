use crate::fixtures::{database, folder_create_payload, folder_name, parent_folder_id, settings};

use hellebore::{
    database::folder_manager::ROOT_FOLDER_ID,
    schema::folder::{FolderCreateSchema, FolderResponseSchema, FolderUpdateSchema},
    services::folder_service,
    settings::Settings,
};
use rstest::*;

fn validate_folder_response(
    folder: &FolderResponseSchema,
    id: Option<i32>,
    parent_id: i32,
    name: &str,
) {
    if let Some(expected_id) = id {
        assert_eq!(expected_id, folder.id);
    }
    assert_eq!(parent_id, folder.parent_id);
    assert_eq!(name, folder.name);
}

#[rstest]
#[tokio::test]
async fn test_create_folder(
    settings: &Settings,
    folder_create_payload: FolderCreateSchema,
    folder_name: String,
) {
    let database = database(settings).await;
    let folder = folder_service::create(&database, folder_create_payload).await;

    assert!(folder.is_ok());
    let folder = folder.unwrap();
    validate_folder_response(&folder, None, folder.parent_id, &folder_name);
}

#[rstest]
#[tokio::test]
async fn test_error_on_creating_folder_with_duplicate_name(
    settings: &Settings,
    folder_create_payload: FolderCreateSchema,
) {
    let database = database(settings).await;
    let _ = folder_service::create(&database, folder_create_payload.clone()).await;
    let response = folder_service::create(&database, folder_create_payload).await;
    assert!(response.is_err());
}

#[rstest]
#[tokio::test]
async fn test_create_folder_with_parent(
    settings: &Settings,
    folder_create_payload: FolderCreateSchema,
    folder_name: String,
) {
    let database = database(settings).await;
    let parent_folder = folder_service::create(&database, folder_create_payload.clone())
        .await
        .unwrap();

    let create_payload = FolderCreateSchema {
        parent_id: parent_folder.id,
        name: parent_folder.name, // the child can have the same name as its parent
    };
    let folder = folder_service::create(&database, create_payload).await;

    assert!(folder.is_ok());
    let folder = folder.unwrap();
    validate_folder_response(&folder, None, parent_folder.id, &folder_name);
}

#[rstest]
#[case(true)]
#[case(false)]
#[tokio::test]
async fn test_create_sibling_folders_with_different_names(
    settings: &Settings,
    folder_create_payload: FolderCreateSchema,
    #[case] in_root: bool,
) {
    let database = database(settings).await;
    let mut parent_id = ROOT_FOLDER_ID;
    if !in_root {
        let parent_folder = folder_service::create(&database, folder_create_payload.clone())
            .await
            .unwrap();
        parent_id = parent_folder.id;
    }

    let payload_1 = FolderCreateSchema {
        parent_id,
        name: "folder1".to_owned(),
    };
    let folder_1 = folder_service::create(&database, payload_1).await;
    assert!(folder_1.is_ok());

    let payload_2 = FolderCreateSchema {
        parent_id,
        name: "folder2".to_owned(),
    };
    let folder_2 = folder_service::create(&database, payload_2).await;
    assert!(folder_2.is_ok());
}

#[rstest]
#[case(true)]
#[case(false)]
#[tokio::test]
async fn test_error_on_creating_sibling_folders_with_same_name(
    settings: &Settings,
    folder_create_payload: FolderCreateSchema,
    #[case] in_root: bool,
) {
    let database = database(settings).await;
    let mut parent_id = ROOT_FOLDER_ID;
    if !in_root {
        let parent_folder = folder_service::create(&database, folder_create_payload.clone())
            .await
            .unwrap();
        parent_id = parent_folder.id;
    }

    let payload_1 = FolderCreateSchema {
        parent_id,
        name: "folder".to_owned(),
    };
    let folder_1 = folder_service::create(&database, payload_1).await;
    assert!(folder_1.is_ok());

    let payload_2 = FolderCreateSchema {
        parent_id,
        name: "folder".to_owned(),
    };
    let folder_2 = folder_service::create(&database, payload_2).await;
    assert!(folder_2.is_err());
}

#[rstest]
#[tokio::test]
async fn test_update_folder(
    settings: &Settings,
    folder_create_payload: FolderCreateSchema,
    parent_folder_id: i32,
) {
    let database = database(settings).await;
    let folder = folder_service::create(&database, folder_create_payload)
        .await
        .unwrap();

    let updated_name = "Updated Folder Name".to_string();
    let update_payload = FolderUpdateSchema {
        id: folder.id,
        parent_id: Some(folder.parent_id),
        name: Some(updated_name.clone()),
    };
    let updated_folder = folder_service::update(&database, update_payload).await;

    assert!(updated_folder.is_ok());
    let updated_folder = updated_folder.unwrap();
    validate_folder_response(
        &updated_folder,
        Some(folder.id),
        parent_folder_id,
        &updated_name,
    );
}

#[rstest]
#[case(true)]
#[case(false)]
#[tokio::test]
async fn test_error_on_updating_folder_with_same_name_as_sibling(
    settings: &Settings,
    folder_create_payload: FolderCreateSchema,
    #[case] in_root: bool,
) {
    let database = database(settings).await;
    let mut parent_id = ROOT_FOLDER_ID;
    if !in_root {
        let parent_folder = folder_service::create(&database, folder_create_payload.clone())
            .await
            .unwrap();
        parent_id = parent_folder.id;
    }

    let payload_1 = FolderCreateSchema {
        parent_id,
        name: "folder1".to_owned(),
    };
    let folder_1 = folder_service::create(&database, payload_1).await.unwrap();

    let payload_2 = FolderCreateSchema {
        parent_id,
        name: "folder2".to_owned(),
    };
    let folder_2 = folder_service::create(&database, payload_2).await.unwrap();

    let update_payload = FolderUpdateSchema {
        id: folder_1.id,
        parent_id: None,
        name: Some(folder_2.name),
    };
    let updated_folder = folder_service::update(&database, update_payload).await;
    assert!(updated_folder.is_err());
}

#[rstest]
#[tokio::test]
async fn test_get_folder(settings: &Settings, folder_create_payload: FolderCreateSchema) {
    let database = database(settings).await;
    let folder = folder_service::create(&database, folder_create_payload)
        .await
        .unwrap();

    let fetched_folder = folder_service::get(&database, folder.id).await;

    assert!(fetched_folder.is_ok());
    let fetched_folder = fetched_folder.unwrap();
    validate_folder_response(
        &fetched_folder,
        Some(folder.id),
        folder.parent_id,
        &folder.name,
    );
}

#[rstest]
#[tokio::test]
async fn test_error_on_getting_nonexistent_folder(settings: &Settings) {
    let database = database(settings).await;
    let response = folder_service::get(&database, 0).await;
    assert!(response.is_err());
}

#[rstest]
#[tokio::test]
async fn test_get_all_folders(settings: &Settings) {
    let database = database(settings).await;

    let folder_1_payload = FolderCreateSchema {
        parent_id: -1,
        name: "folder1".to_owned(),
    };
    let folder_1 = folder_service::create(&database, folder_1_payload)
        .await
        .unwrap();

    let folder_2_payload = FolderCreateSchema {
        parent_id: -1,
        name: "folder2".to_owned(),
    };
    let folder_2 = folder_service::create(&database, folder_2_payload)
        .await
        .unwrap();

    let folders = folder_service::get_all(&database).await;
    assert!(folders.is_ok());
    let folders = folders.unwrap();

    assert_eq!(folders.len(), 2);
    let mut sorted_folders = folders;
    sorted_folders.sort_by(|a, b| a.name.cmp(&b.name));

    validate_folder_response(
        &sorted_folders[0],
        Some(folder_1.id),
        folder_1.parent_id,
        &folder_1.name,
    );
    validate_folder_response(
        &sorted_folders[1],
        Some(folder_2.id),
        folder_2.parent_id,
        &folder_2.name,
    );
}

#[rstest]
#[tokio::test]
async fn test_delete_folder(settings: &Settings, folder_create_payload: FolderCreateSchema) {
    let database = database(settings).await;
    let folder = folder_service::create(&database, folder_create_payload)
        .await
        .unwrap();

    let response = folder_service::delete(&database, folder.id).await;
    assert!(response.is_ok());

    let folder = folder_service::get(&database, folder.id).await;
    assert!(folder.is_err());
}

#[rstest]
#[tokio::test]
async fn test_error_on_deleting_nonexistent_folder(settings: &Settings) {
    let database = database(settings).await;
    let response = folder_service::delete(&database, 0).await;
    assert!(response.is_err());
}
