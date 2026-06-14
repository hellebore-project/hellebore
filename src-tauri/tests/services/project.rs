use std::fs;
use std::path::Path;

use hellebore::{
    constants::PROJECT_CONFIG_FILE_NAME,
    model::{config::AppConfig, errors::Error, state::State},
    schema::project::ProjectConfigFileSchema,
    services::project_service,
    types::entity::PROJECT,
};
use rstest::*;

use crate::fixtures::project::{
    TempProjectDir, missing_project_id, project_name, temp_project_dir, updated_project_name,
};

fn create_state() -> State {
    State::new(AppConfig {
        recent_project_paths: vec![],
    })
}

#[rstest]
#[tokio::test]
async fn test_create_project(project_name: String, temp_project_dir: TempProjectDir) {
    let state = create_state();
    let mut state = state.lock().await;

    let response =
        project_service::create(&mut state, &project_name, temp_project_dir.path(), true).await;

    assert!(response.is_ok());
    let response = response.unwrap();
    assert_eq!(response.name, project_name);

    let project = state.get_project(&response.id);
    assert!(project.is_some());

    let project = project.unwrap();
    assert_eq!(project.folder_path, temp_project_dir.path());
    assert!(project.database.in_memory);
    assert_eq!(
        state.config.recent_project_paths,
        vec![temp_project_dir.path()]
    );

    let config_path = format!("{}/{}", temp_project_dir.path(), PROJECT_CONFIG_FILE_NAME);
    assert!(!Path::new(&config_path).exists());
}

#[rstest]
#[tokio::test]
async fn test_error_on_loading_project_without_folder_path() {
    let state = create_state();
    let mut state = state.lock().await;

    let folder_path = None;
    let response = project_service::load(&mut state, &folder_path).await;

    assert!(response.is_err());
    match response.unwrap_err() {
        Error::NotFound { entity_type, .. } => assert_eq!(entity_type, PROJECT),
        err => panic!("Unexpected error: {err:?}"),
    }
}

#[rstest]
#[tokio::test]
async fn test_update_project(
    project_name: String,
    updated_project_name: String,
    temp_project_dir: TempProjectDir,
) {
    let state = create_state();
    let mut state = state.lock().await;

    let created =
        project_service::create(&mut state, &project_name, temp_project_dir.path(), true).await;
    assert!(created.is_ok());
    let created = created.unwrap();

    let updated = project_service::update(&mut state, &created.id, &updated_project_name).await;

    assert!(updated.is_ok());
    let updated = updated.unwrap();
    assert_eq!(updated.id, created.id);
    assert_eq!(updated.name, updated_project_name);

    let project = state.get_project(&created.id);
    assert!(project.is_some());
    assert_eq!(project.unwrap().name, updated_project_name);

    let config_path = format!("{}/{}", temp_project_dir.path(), PROJECT_CONFIG_FILE_NAME);
    assert!(Path::new(&config_path).exists());

    let config_text = fs::read_to_string(&config_path);
    assert!(config_text.is_ok());

    let config = serde_json::from_str::<ProjectConfigFileSchema>(&config_text.unwrap());
    assert!(config.is_ok());
    assert_eq!(config.unwrap().name, updated_project_name);
}

#[rstest]
#[tokio::test]
async fn test_error_on_updating_missing_project(
    updated_project_name: String,
    missing_project_id: String,
) {
    let state = create_state();
    let mut state = state.lock().await;

    let response =
        project_service::update(&mut state, &missing_project_id, &updated_project_name).await;

    assert!(response.is_err());
    match response.unwrap_err() {
        Error::NotFound {
            entity_type, id, ..
        } => {
            assert_eq!(entity_type, PROJECT);
            assert_eq!(id, missing_project_id);
        }
        err => panic!("Unexpected error: {err:?}"),
    }
}

#[rstest]
#[tokio::test]
async fn test_close_project(project_name: String, temp_project_dir: TempProjectDir) {
    let state = create_state();
    let mut state = state.lock().await;

    let created =
        project_service::create(&mut state, &project_name, temp_project_dir.path(), true).await;
    assert!(created.is_ok());
    let created = created.unwrap();

    let response = project_service::close(&mut state, &created.id).await;

    assert!(response.is_ok());
    assert!(state.get_project(&created.id).is_none());
}

#[rstest]
#[tokio::test]
async fn test_error_on_closing_missing_project(missing_project_id: String) {
    let state = create_state();
    let mut state = state.lock().await;

    let response = project_service::close(&mut state, &missing_project_id).await;

    assert!(response.is_err());
    match response.unwrap_err() {
        Error::NotFound {
            entity_type, id, ..
        } => {
            assert_eq!(entity_type, PROJECT);
            assert_eq!(id, missing_project_id);
        }
        err => panic!("Unexpected error: {err:?}"),
    }
}

#[rstest]
#[tokio::test]
async fn test_get_database_for_loaded_project(
    project_name: String,
    temp_project_dir: TempProjectDir,
) {
    let state = create_state();
    let mut state = state.lock().await;

    let created =
        project_service::create(&mut state, &project_name, temp_project_dir.path(), true).await;
    assert!(created.is_ok());
    let created = created.unwrap();

    let database = project_service::get_database(&state, &created.id);
    assert!(database.is_ok());
}

#[rstest]
#[tokio::test]
async fn test_error_on_getting_database_for_missing_project(missing_project_id: String) {
    let state = create_state();
    let state = state.lock().await;

    let response = project_service::get_database(&state, &missing_project_id);

    assert!(response.is_err());
    match response.unwrap_err() {
        Error::NotFound {
            entity_type, id, ..
        } => {
            assert_eq!(entity_type, PROJECT);
            assert_eq!(id, missing_project_id);
        }
        err => panic!("Unexpected error: {err:?}"),
    }
}
