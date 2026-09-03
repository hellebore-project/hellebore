use hellebore::{
    schema::{PaginationRequestSchema, entry::EntryListRequestSchema},
    services::entry_service,
};
use rstest::*;
use uuid::Uuid;

use crate::fixtures::{database, folder::folder_id};
use crate::utils::{
    db::{create_generic_entries, create_generic_entry},
    validation::validate_generic_entry_info_response,
};

#[fixture]
pub fn list_entry_payload() -> PaginationRequestSchema<EntryListRequestSchema> {
    PaginationRequestSchema {
        data: EntryListRequestSchema {
            keyword: Some("".to_owned()),
        },
        page_index: 0,
        offset: None,
        limit: None,
        include_total: true,
    }
}

#[rstest]
#[tokio::test]
async fn test_list_all_entries(folder_id: Uuid) {
    let database = database().await;

    create_generic_entry(&database, folder_id, "A".to_owned(), "".to_owned()).await;
    create_generic_entry(&database, folder_id, "B".to_owned(), "".to_owned()).await;

    let response = entry_service::list(&database, None).await;

    assert!(response.is_ok());
    let response = response.unwrap();

    let mut entries = response.items;
    assert_eq!(2, entries.len());
    entries.sort_by(|a, b| a.title.cmp(&b.title));
    validate_generic_entry_info_response(&entries[0], None, folder_id, "A");
    validate_generic_entry_info_response(&entries[1], None, folder_id, "B");
}

#[rstest]
#[tokio::test]
async fn test_list_entries_without_title_filter(
    folder_id: Uuid,
    mut list_entry_payload: PaginationRequestSchema<EntryListRequestSchema>,
) {
    let database = database().await;

    create_generic_entry(&database, folder_id, "A".to_owned(), "".to_owned()).await;
    create_generic_entry(&database, folder_id, "B".to_owned(), "".to_owned()).await;

    list_entry_payload.data.keyword = None;

    let response = entry_service::list(&database, Some(list_entry_payload)).await;

    assert!(response.is_ok());
    let response = response.unwrap();

    let mut entries = response.items;
    assert_eq!(2, entries.len());
    entries.sort_by(|a, b| a.title.cmp(&b.title));
    validate_generic_entry_info_response(&entries[0], None, folder_id, "A");
    validate_generic_entry_info_response(&entries[1], None, folder_id, "B");
}

#[rstest]
#[tokio::test]
async fn test_list_entries_with_exact_title_match(
    folder_id: Uuid,
    mut list_entry_payload: PaginationRequestSchema<EntryListRequestSchema>,
) {
    let database = database().await;

    let entry = create_generic_entry(
        &database,
        folder_id,
        "Rust Programming".to_owned(),
        "".to_owned(),
    )
    .await;

    list_entry_payload.data.keyword = Some("Rust Programming".to_owned());

    let results = entry_service::list(&database, Some(list_entry_payload)).await;

    assert!(results.is_ok());
    let results = results.unwrap();
    assert_eq!(results.items.len(), 1);
    assert_eq!(results.items[0].id, entry.id);
    assert_eq!(results.items[0].title, "Rust Programming");
}

#[rstest]
#[tokio::test]
async fn test_list_entries_title_starts_with_keyword(
    folder_id: Uuid,
    mut list_entry_payload: PaginationRequestSchema<EntryListRequestSchema>,
) {
    let database = database().await;

    let entry = create_generic_entry(
        &database,
        folder_id,
        "Rust Guide for Beginners".to_owned(),
        "".to_owned(),
    )
    .await;

    list_entry_payload.data.keyword = Some("Rust".to_owned());

    let results = entry_service::list(&database, Some(list_entry_payload)).await;

    assert!(results.is_ok());
    let results = results.unwrap();
    assert_eq!(results.items.len(), 1);
    assert_eq!(results.items[0].id, entry.id);
}

#[rstest]
#[tokio::test]
async fn test_list_entries_title_ends_with_keyword(
    folder_id: Uuid,
    mut list_entry_payload: PaginationRequestSchema<EntryListRequestSchema>,
) {
    let database = database().await;

    let entry = create_generic_entry(
        &database,
        folder_id,
        "Learn Programming".to_owned(),
        "".to_owned(),
    )
    .await;

    list_entry_payload.data.keyword = Some("Programming".to_owned());

    let results = entry_service::list(&database, Some(list_entry_payload)).await;

    assert!(results.is_ok());
    let results = results.unwrap();
    assert_eq!(results.items.len(), 1);
    assert_eq!(results.items[0].id, entry.id);
}

#[rstest]
#[tokio::test]
async fn test_list_entries_title_contains_keyword(
    folder_id: Uuid,
    mut list_entry_payload: PaginationRequestSchema<EntryListRequestSchema>,
) {
    let database = database().await;

    let entry = create_generic_entry(
        &database,
        folder_id,
        "Advanced Rust Patterns".to_owned(),
        "".to_owned(),
    )
    .await;

    list_entry_payload.data.keyword = Some("Rust".to_owned());

    let results = entry_service::list(&database, Some(list_entry_payload)).await;

    assert!(results.is_ok());
    let results = results.unwrap();
    assert_eq!(results.items.len(), 1);
    assert_eq!(results.items[0].id, entry.id);
}

#[rstest]
#[tokio::test]
async fn test_list_entries_title_does_not_contain_keyword(
    folder_id: Uuid,
    mut list_entry_payload: PaginationRequestSchema<EntryListRequestSchema>,
) {
    let database = database().await;

    let _entry = create_generic_entry(
        &database,
        folder_id,
        "Python Basics".to_owned(),
        "".to_owned(),
    )
    .await;

    list_entry_payload.data.keyword = Some("Rust".to_owned());

    let results = entry_service::list(&database, Some(list_entry_payload)).await;

    assert!(results.is_ok());
    let results = results.unwrap();
    assert_eq!(results.items.len(), 0);
}

#[rstest]
#[tokio::test]
async fn test_list_entries_title_contains_partial_keyword(
    folder_id: Uuid,
    mut list_entry_payload: PaginationRequestSchema<EntryListRequestSchema>,
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
    list_entry_payload.data.keyword = Some("Program".to_owned());

    let results = entry_service::list(&database, Some(list_entry_payload)).await;

    assert!(results.is_ok());
    let results = results.unwrap();
    assert_eq!(results.items.len(), 1);
    assert_eq!(results.items[0].id, entry.id);
}

#[rstest]
#[tokio::test]
async fn test_list_entries_title_contains_keyword_with_typo(
    folder_id: Uuid,
    mut list_entry_payload: PaginationRequestSchema<EntryListRequestSchema>,
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
    list_entry_payload.data.keyword = Some("Prgram".to_owned());

    let results = entry_service::list(&database, Some(list_entry_payload)).await;

    assert!(results.is_ok());
    let results = results.unwrap();
    assert_eq!(results.items.len(), 0);
}

#[rstest]
#[tokio::test]
async fn test_list_entries_with_empty_keyword_matches_all_entries(
    mut list_entry_payload: PaginationRequestSchema<EntryListRequestSchema>,
) {
    let database = database().await;

    let titles = vec!["Charlie".to_owned(), "Alpha".to_owned(), "Bravo".to_owned()];
    create_generic_entries(&database, titles).await;

    list_entry_payload.data.keyword = Some("".to_owned());

    let results = entry_service::list(&database, Some(list_entry_payload)).await;
    assert!(results.is_ok());

    let results = results.unwrap();
    assert_eq!(results.items.len(), 3);
    assert_eq!(
        results
            .items
            .iter()
            .map(|entry| entry.title.as_str())
            .collect::<Vec<_>>(),
        vec!["Alpha", "Bravo", "Charlie"]
    );
    assert_eq!(results.page_index, 0);
    assert_eq!(results.page_count, Some(1));
    assert_eq!(results.item_count, 3);
    assert_eq!(results.total, Some(3));
}

#[rstest]
#[tokio::test]
async fn test_list_entries_omits_total_when_include_total_is_false(
    mut list_entry_payload: PaginationRequestSchema<EntryListRequestSchema>,
) {
    let database = database().await;

    let titles = vec![
        "Rust A".to_owned(),
        "Rust B".to_owned(),
        "Rust C".to_owned(),
        "Rust D".to_owned(),
    ];
    create_generic_entries(&database, titles).await;

    list_entry_payload.data.keyword = Some("Rust".to_owned());
    list_entry_payload.offset = Some(1);
    list_entry_payload.limit = Some(2);
    list_entry_payload.include_total = false;

    let results = entry_service::list(&database, Some(list_entry_payload)).await;
    assert!(results.is_ok());

    let results = results.unwrap();
    assert_eq!(results.items.len(), 2);
    assert_eq!(results.items[0].title, "Rust B");
    assert_eq!(results.items[1].title, "Rust C");
    assert_eq!(results.page_index, 1);
    assert_eq!(results.page_count, None);
    assert_eq!(results.item_count, 2);
    assert_eq!(results.total, None);
}

#[rstest]
#[tokio::test]
async fn test_list_entries_with_limit(
    mut list_entry_payload: PaginationRequestSchema<EntryListRequestSchema>,
) {
    let database = database().await;

    let titles = vec![
        "Rust A".to_owned(),
        "Rust B".to_owned(),
        "Rust C".to_owned(),
    ];
    create_generic_entries(&database, titles).await;

    list_entry_payload.data.keyword = Some("Rust".to_owned());
    list_entry_payload.limit = Some(2);

    let results = entry_service::list(&database, Some(list_entry_payload)).await;
    assert!(results.is_ok());

    let results = results.unwrap();
    assert_eq!(results.items.len(), 2);

    assert_eq!(results.items[0].title, "Rust A");
    assert_eq!(results.items[1].title, "Rust B");
}

// FIXME: sea-orm doesn't build the SQL query correctly when only the offset is specified
#[rstest]
#[should_panic]
#[tokio::test]
async fn test_list_entries_with_offset(
    mut list_entry_payload: PaginationRequestSchema<EntryListRequestSchema>,
) {
    let database = database().await;

    let titles = vec![
        "Rust A".to_owned(),
        "Rust B".to_owned(),
        "Rust C".to_owned(),
    ];
    create_generic_entries(&database, titles).await;

    list_entry_payload.data.keyword = Some("Rust".to_owned());
    list_entry_payload.offset = Some(1);

    let results = entry_service::list(&database, Some(list_entry_payload)).await;
    assert!(results.is_ok());

    let results = results.unwrap();
    assert_eq!(results.items.len(), 2);

    assert_eq!(results.items[0].title, "Rust B");
    assert_eq!(results.items[1].title, "Rust C");
}

#[rstest]
#[tokio::test]
async fn test_list_entries_with_limit_and_offset(
    mut list_entry_payload: PaginationRequestSchema<EntryListRequestSchema>,
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

    list_entry_payload.data.keyword = Some("Rust".to_owned());
    list_entry_payload.offset = Some(2);
    list_entry_payload.limit = Some(2);

    let results = entry_service::list(&database, Some(list_entry_payload)).await;
    assert!(results.is_ok());

    let results = results.unwrap();
    assert_eq!(results.items.len(), 2);

    assert_eq!(results.items[0].title, "Rust C");
    assert_eq!(results.items[1].title, "Rust D");
}
