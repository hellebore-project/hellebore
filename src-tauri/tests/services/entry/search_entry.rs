use hellebore::{schema::entry::EntrySearchSchema, services::entry_service, settings::Settings};
use rstest::*;

use crate::{
    fixtures::{database, folder::folder_id, settings},
    utils::db::{create_generic_entries, create_generic_entry},
};

#[fixture]
pub fn search_entry_payload() -> EntrySearchSchema {
    EntrySearchSchema {
        keyword: "".to_owned(),
        before: None,
        after: None,
        limit: 2,
    }
}

#[rstest]
#[tokio::test]
async fn test_search_entry_with_exact_title_match(
    settings: &Settings,
    folder_id: i32,
    mut search_entry_payload: EntrySearchSchema,
) {
    let database = database(settings).await;

    let entry = create_generic_entry(
        &database,
        folder_id,
        "Rust Programming".to_owned(),
        "".to_owned(),
    )
    .await;

    search_entry_payload.keyword = "Rust Programming".to_owned();

    let results = entry_service::search(&database, search_entry_payload).await;

    assert!(results.is_ok());
    let results = results.unwrap();
    assert_eq!(results.len(), 1);
    assert_eq!(results[0].id, entry.id);
    assert_eq!(results[0].title, "Rust Programming");
}

#[rstest]
#[tokio::test]
async fn test_search_entry_title_starts_with_keyword(
    settings: &Settings,
    folder_id: i32,
    mut search_entry_payload: EntrySearchSchema,
) {
    let database = database(settings).await;

    let entry = create_generic_entry(
        &database,
        folder_id,
        "Rust Guide for Beginners".to_owned(),
        "".to_owned(),
    )
    .await;

    search_entry_payload.keyword = "Rust".to_owned();

    let results = entry_service::search(&database, search_entry_payload).await;

    assert!(results.is_ok());
    let results = results.unwrap();
    assert_eq!(results.len(), 1);
    assert_eq!(results[0].id, entry.id);
}

#[rstest]
#[tokio::test]
async fn test_search_entry_title_ends_with_keyword(
    settings: &Settings,
    folder_id: i32,
    mut search_entry_payload: EntrySearchSchema,
) {
    let database = database(settings).await;

    let entry = create_generic_entry(
        &database,
        folder_id,
        "Learn Programming".to_owned(),
        "".to_owned(),
    )
    .await;

    search_entry_payload.keyword = "Programming".to_owned();

    let results = entry_service::search(&database, search_entry_payload).await;

    assert!(results.is_ok());
    let results = results.unwrap();
    assert_eq!(results.len(), 1);
    assert_eq!(results[0].id, entry.id);
}

#[rstest]
#[tokio::test]
async fn test_search_entry_title_contains_keyword(
    settings: &Settings,
    folder_id: i32,
    mut search_entry_payload: EntrySearchSchema,
) {
    let database = database(settings).await;

    let entry = create_generic_entry(
        &database,
        folder_id,
        "Advanced Rust Patterns".to_owned(),
        "".to_owned(),
    )
    .await;

    search_entry_payload.keyword = "Rust".to_owned();

    let results = entry_service::search(&database, search_entry_payload).await;

    assert!(results.is_ok());
    let results = results.unwrap();
    assert_eq!(results.len(), 1);
    assert_eq!(results[0].id, entry.id);
}

#[rstest]
#[tokio::test]
async fn test_search_entry_title_does_not_contain_keyword(
    settings: &Settings,
    folder_id: i32,
    mut search_entry_payload: EntrySearchSchema,
) {
    let database = database(settings).await;

    let _entry = create_generic_entry(
        &database,
        folder_id,
        "Python Basics".to_owned(),
        "".to_owned(),
    )
    .await;

    search_entry_payload.keyword = "Rust".to_owned();

    let results = entry_service::search(&database, search_entry_payload).await;

    assert!(results.is_ok());
    let results = results.unwrap();
    assert_eq!(results.len(), 0);
}

#[rstest]
#[tokio::test]
async fn test_search_entry_title_contains_partial_keyword(
    settings: &Settings,
    folder_id: i32,
    mut search_entry_payload: EntrySearchSchema,
) {
    let database = database(settings).await;

    let entry = create_generic_entry(
        &database,
        folder_id,
        "Programming in Rust".to_owned(),
        "".to_owned(),
    )
    .await;

    // Search for "Program" which is a partial match of "Programming"
    search_entry_payload.keyword = "Program".to_owned();

    let results = entry_service::search(&database, search_entry_payload).await;

    assert!(results.is_ok());
    let results = results.unwrap();
    assert_eq!(results.len(), 1);
    assert_eq!(results[0].id, entry.id);
}

#[rstest]
#[tokio::test]
async fn test_search_entry_title_contains_keyword_with_typo(
    settings: &Settings,
    folder_id: i32,
    mut search_entry_payload: EntrySearchSchema,
) {
    let database = database(settings).await;

    let _entry = create_generic_entry(
        &database,
        folder_id,
        "Programming in Rust".to_owned(),
        "".to_owned(),
    )
    .await;

    // keyword is missing a letter
    search_entry_payload.keyword = "Prgram".to_owned();

    let results = entry_service::search(&database, search_entry_payload).await;

    assert!(results.is_ok());
    let results = results.unwrap();
    assert_eq!(results.len(), 0);
}

#[rstest]
#[tokio::test]
async fn test_search_entry_with_limit(
    settings: &Settings,
    mut search_entry_payload: EntrySearchSchema,
) {
    let database = database(settings).await;

    let titles = vec![
        "Rust A".to_owned(),
        "Rust B".to_owned(),
        "Rust C".to_owned(),
    ];
    create_generic_entries(&database, titles).await;

    search_entry_payload.keyword = "Rust".to_owned();
    search_entry_payload.limit = 2;

    let results = entry_service::search(&database, search_entry_payload).await;
    assert!(results.is_ok());
    let results = results.unwrap();
    assert_eq!(results.len(), 2);
}

#[rstest]
#[tokio::test]
async fn test_search_entry_with_after_cursor(
    settings: &Settings,
    mut search_entry_payload: EntrySearchSchema,
) {
    let database = database(settings).await;

    let titles = vec![
        "Rust C".to_owned(),
        "Rust A".to_owned(),
        "Rust E".to_owned(),
        "Rust D".to_owned(),
        "Rust B".to_owned(),
    ];
    create_generic_entries(&database, titles).await;

    search_entry_payload.keyword = "Rust".to_owned();
    search_entry_payload.after = Some("Rust C".to_owned());
    search_entry_payload.limit = 10;

    let results = entry_service::search(&database, search_entry_payload).await;

    assert!(results.is_ok());
    let results = results.unwrap();
    assert_eq!(results.len(), 2);
    assert_eq!(results[0].title, "Rust D");
    assert_eq!(results[1].title, "Rust E");
}

#[rstest]
#[tokio::test]
async fn test_search_entry_with_before_cursor(
    settings: &Settings,
    mut search_entry_payload: EntrySearchSchema,
) {
    let database = database(settings).await;

    let titles = vec![
        "Rust C".to_owned(),
        "Rust A".to_owned(),
        "Rust E".to_owned(),
        "Rust D".to_owned(),
        "Rust B".to_owned(),
    ];
    create_generic_entries(&database, titles).await;

    search_entry_payload.keyword = "Rust".to_owned();
    search_entry_payload.before = Some("Rust C".to_owned());
    search_entry_payload.limit = 10;

    let results = entry_service::search(&database, search_entry_payload).await;

    assert!(results.is_ok());
    let results = results.unwrap();
    assert_eq!(results.len(), 2);
    assert_eq!(results[0].title, "Rust A");
    assert_eq!(results[1].title, "Rust B");
}
