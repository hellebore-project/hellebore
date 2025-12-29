use hellebore::{services::entry_service, settings::Settings, types::entity::ENTRY};
use rstest::*;

use crate::fixtures::{database, folder::folder_id, settings};

#[rstest]
#[tokio::test]
async fn test_search_entry_with_exact_title_match(settings: &Settings, folder_id: i32) {
    let database = database(settings).await;

    let entry = entry_service::_create(
        &database,
        ENTRY,
        folder_id,
        "Rust Programming".to_owned(),
        "".to_owned(),
    )
    .await
    .unwrap();

    let results = entry_service::search(&database, "Rust Programming").await;
    assert!(results.is_ok());
    let results = results.unwrap();
    assert_eq!(results.len(), 1);
    assert_eq!(results[0].id, entry.id);
    assert_eq!(results[0].title, "Rust Programming");
}

#[rstest]
#[tokio::test]
async fn test_search_entry_title_starts_with_keyword(settings: &Settings, folder_id: i32) {
    let database = database(settings).await;

    let entry = entry_service::_create(
        &database,
        ENTRY,
        folder_id,
        "Rust Guide for Beginners".to_owned(),
        "".to_owned(),
    )
    .await
    .unwrap();

    let results = entry_service::search(&database, "Rust").await;
    assert!(results.is_ok());
    let results = results.unwrap();
    assert_eq!(results.len(), 1);
    assert_eq!(results[0].id, entry.id);
}

#[rstest]
#[tokio::test]
async fn test_search_entry_title_ends_with_keyword(settings: &Settings, folder_id: i32) {
    let database = database(settings).await;

    let entry = entry_service::_create(
        &database,
        ENTRY,
        folder_id,
        "Learn Programming".to_owned(),
        "".to_owned(),
    )
    .await
    .unwrap();

    let results = entry_service::search(&database, "Programming").await;
    assert!(results.is_ok());
    let results = results.unwrap();
    assert_eq!(results.len(), 1);
    assert_eq!(results[0].id, entry.id);
}

#[rstest]
#[tokio::test]
async fn test_search_entry_title_contains_keyword(settings: &Settings, folder_id: i32) {
    let database = database(settings).await;

    let entry = entry_service::_create(
        &database,
        ENTRY,
        folder_id,
        "Advanced Rust Patterns".to_owned(),
        "".to_owned(),
    )
    .await
    .unwrap();

    let results = entry_service::search(&database, "Rust").await;
    assert!(results.is_ok());
    let results = results.unwrap();
    assert_eq!(results.len(), 1);
    assert_eq!(results[0].id, entry.id);
}

#[rstest]
#[tokio::test]
async fn test_search_entry_title_does_not_contain_keyword(settings: &Settings, folder_id: i32) {
    let database = database(settings).await;

    let _entry = entry_service::_create(
        &database,
        ENTRY,
        folder_id,
        "Python Basics".to_owned(),
        "".to_owned(),
    )
    .await
    .unwrap();

    let results = entry_service::search(&database, "Rust").await;
    assert!(results.is_ok());
    let results = results.unwrap();
    assert_eq!(results.len(), 0);
}

#[rstest]
#[tokio::test]
async fn test_search_entry_title_contains_partial_keyword(settings: &Settings, folder_id: i32) {
    let database = database(settings).await;

    let entry = entry_service::_create(
        &database,
        ENTRY,
        folder_id,
        "Programming in Rust".to_owned(),
        "".to_owned(),
    )
    .await
    .unwrap();

    // Search for "Program" which is a partial match of "Programming"
    let results = entry_service::search(&database, "Program").await;
    assert!(results.is_ok());
    let results = results.unwrap();
    assert_eq!(results.len(), 1);
    assert_eq!(results[0].id, entry.id);
}

#[rstest]
#[tokio::test]
async fn test_search_entry_title_contains_keyword_with_typo(settings: &Settings, folder_id: i32) {
    let database = database(settings).await;

    let _entry = entry_service::_create(
        &database,
        ENTRY,
        folder_id,
        "Programming in Rust".to_owned(),
        "".to_owned(),
    )
    .await
    .unwrap();

    // keyword is missing a letter
    let results = entry_service::search(&database, "Prgram").await;
    assert!(results.is_ok());
    let results = results.unwrap();
    assert_eq!(results.len(), 0);
}
