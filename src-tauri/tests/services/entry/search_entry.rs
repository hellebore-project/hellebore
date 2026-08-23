use hellebore::{
    schema::{common::PaginationRequestSchema, entry::EntrySearchSchema},
    services::entry_service,
};
use rstest::*;
use uuid::Uuid;

use crate::{
    fixtures::{database, folder::folder_id},
    utils::db::{create_generic_entries, create_generic_entry},
};

#[fixture]
pub fn search_entry_payload() -> PaginationRequestSchema<EntrySearchSchema> {
    PaginationRequestSchema {
        data: EntrySearchSchema {
            keyword: "".to_owned(),
        },
        offset: None,
        limit: None,
    }
}

#[rstest]
#[tokio::test]
async fn test_search_entry_with_exact_title_match(
    folder_id: Uuid,
    mut search_entry_payload: PaginationRequestSchema<EntrySearchSchema>,
) {
    let database = database().await;

    let entry = create_generic_entry(
        &database,
        folder_id,
        "Rust Programming".to_owned(),
        "".to_owned(),
    )
    .await;

    search_entry_payload.data.keyword = "Rust Programming".to_owned();

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
    folder_id: Uuid,
    mut search_entry_payload: PaginationRequestSchema<EntrySearchSchema>,
) {
    let database = database().await;

    let entry = create_generic_entry(
        &database,
        folder_id,
        "Rust Guide for Beginners".to_owned(),
        "".to_owned(),
    )
    .await;

    search_entry_payload.data.keyword = "Rust".to_owned();

    let results = entry_service::search(&database, search_entry_payload).await;

    assert!(results.is_ok());
    let results = results.unwrap();
    assert_eq!(results.len(), 1);
    assert_eq!(results[0].id, entry.id);
}

#[rstest]
#[tokio::test]
async fn test_search_entry_title_ends_with_keyword(
    folder_id: Uuid,
    mut search_entry_payload: PaginationRequestSchema<EntrySearchSchema>,
) {
    let database = database().await;

    let entry = create_generic_entry(
        &database,
        folder_id,
        "Learn Programming".to_owned(),
        "".to_owned(),
    )
    .await;

    search_entry_payload.data.keyword = "Programming".to_owned();

    let results = entry_service::search(&database, search_entry_payload).await;

    assert!(results.is_ok());
    let results = results.unwrap();
    assert_eq!(results.len(), 1);
    assert_eq!(results[0].id, entry.id);
}

#[rstest]
#[tokio::test]
async fn test_search_entry_title_contains_keyword(
    folder_id: Uuid,
    mut search_entry_payload: PaginationRequestSchema<EntrySearchSchema>,
) {
    let database = database().await;

    let entry = create_generic_entry(
        &database,
        folder_id,
        "Advanced Rust Patterns".to_owned(),
        "".to_owned(),
    )
    .await;

    search_entry_payload.data.keyword = "Rust".to_owned();

    let results = entry_service::search(&database, search_entry_payload).await;

    assert!(results.is_ok());
    let results = results.unwrap();
    assert_eq!(results.len(), 1);
    assert_eq!(results[0].id, entry.id);
}

#[rstest]
#[tokio::test]
async fn test_search_entry_title_does_not_contain_keyword(
    folder_id: Uuid,
    mut search_entry_payload: PaginationRequestSchema<EntrySearchSchema>,
) {
    let database = database().await;

    let _entry = create_generic_entry(
        &database,
        folder_id,
        "Python Basics".to_owned(),
        "".to_owned(),
    )
    .await;

    search_entry_payload.data.keyword = "Rust".to_owned();

    let results = entry_service::search(&database, search_entry_payload).await;

    assert!(results.is_ok());
    let results = results.unwrap();
    assert_eq!(results.len(), 0);
}

#[rstest]
#[tokio::test]
async fn test_search_entry_title_contains_partial_keyword(
    folder_id: Uuid,
    mut search_entry_payload: PaginationRequestSchema<EntrySearchSchema>,
) {
    let database = database().await;

    let entry = create_generic_entry(
        &database,
        folder_id,
        "Programming in Rust".to_owned(),
        "".to_owned(),
    )
    .await;

    // Search for "Program" which is a partial match of "Programming"
    search_entry_payload.data.keyword = "Program".to_owned();

    let results = entry_service::search(&database, search_entry_payload).await;

    assert!(results.is_ok());
    let results = results.unwrap();
    assert_eq!(results.len(), 1);
    assert_eq!(results[0].id, entry.id);
}

#[rstest]
#[tokio::test]
async fn test_search_entry_title_contains_keyword_with_typo(
    folder_id: Uuid,
    mut search_entry_payload: PaginationRequestSchema<EntrySearchSchema>,
) {
    let database = database().await;

    let _entry = create_generic_entry(
        &database,
        folder_id,
        "Programming in Rust".to_owned(),
        "".to_owned(),
    )
    .await;

    // keyword is missing a letter
    search_entry_payload.data.keyword = "Prgram".to_owned();

    let results = entry_service::search(&database, search_entry_payload).await;

    assert!(results.is_ok());
    let results = results.unwrap();
    assert_eq!(results.len(), 0);
}

#[rstest]
#[tokio::test]
async fn test_search_entry_with_limit(
    mut search_entry_payload: PaginationRequestSchema<EntrySearchSchema>,
) {
    let database = database().await;

    let titles = vec![
        "Rust A".to_owned(),
        "Rust B".to_owned(),
        "Rust C".to_owned(),
    ];
    create_generic_entries(&database, titles).await;

    search_entry_payload.data.keyword = "Rust".to_owned();
    search_entry_payload.limit = Some(2);

    let results = entry_service::search(&database, search_entry_payload).await;
    assert!(results.is_ok());

    let results = results.unwrap();
    assert_eq!(results.len(), 2);

    assert_eq!(results[0].title, "Rust A");
    assert_eq!(results[1].title, "Rust B");
}

// FIXME: sea-orm doesn't build the SQL query correctly when only the offset is specified
#[rstest]
#[should_panic]
#[tokio::test]
async fn test_search_entry_with_offset(
    mut search_entry_payload: PaginationRequestSchema<EntrySearchSchema>,
) {
    let database = database().await;

    let titles = vec![
        "Rust A".to_owned(),
        "Rust B".to_owned(),
        "Rust C".to_owned(),
    ];
    create_generic_entries(&database, titles).await;

    search_entry_payload.data.keyword = "Rust".to_owned();
    search_entry_payload.offset = Some(1);

    let results = entry_service::search(&database, search_entry_payload).await;
    assert!(results.is_ok());

    let results = results.unwrap();
    assert_eq!(results.len(), 2);

    assert_eq!(results[0].title, "Rust B");
    assert_eq!(results[1].title, "Rust C");
}

#[rstest]
#[tokio::test]
async fn test_search_entry_with_limit_and_offset(
    mut search_entry_payload: PaginationRequestSchema<EntrySearchSchema>,
) {
    let database = database().await;

    let titles = vec![
        "Rust A".to_owned(),
        "Rust B".to_owned(),
        "Rust C".to_owned(),
        "Rust D".to_owned(),
        "Rust E".to_owned(),
    ];
    create_generic_entries(&database, titles).await;

    search_entry_payload.data.keyword = "Rust".to_owned();
    search_entry_payload.offset = Some(2);
    search_entry_payload.limit = Some(2);

    let results = entry_service::search(&database, search_entry_payload).await;
    assert!(results.is_ok());

    let results = results.unwrap();
    assert_eq!(results.len(), 2);

    assert_eq!(results[0].title, "Rust C");
    assert_eq!(results[1].title, "Rust D");
}
