use rstest::*;
use uuid::Uuid;

use hellebore::{
    database::{language_manager, word_manager},
    schema::{entry::EntryCreateSchema, word::WordUpsertSchema},
    services::{entry_service, word_service},
};

use crate::{
    fixtures::{database, language::create_language_payload, word::create_word_payload},
    utils::db::upsert_word,
};

#[rstest]
#[tokio::test]
async fn test_delete_word(
    create_language_payload: EntryCreateSchema,
    mut create_word_payload: WordUpsertSchema,
) {
    let db = database().await;
    let language = entry_service::create(&db, create_language_payload)
        .await
        .unwrap();

    create_word_payload.language_id = Some(language.id);
    let id = upsert_word(&db, &create_word_payload).await.unwrap();

    let response = word_service::delete(&db, id).await;
    assert!(response.is_ok());
}

#[rstest]
#[tokio::test]
async fn test_error_on_deleting_nonexistent_word() {
    let database = database().await;
    let response = word_service::delete(&database, Uuid::new_v4()).await;
    assert!(response.is_err());
}

#[rstest]
#[tokio::test]
async fn test_all_words_deleted_on_delete_language(
    create_language_payload: EntryCreateSchema,
    mut create_word_payload: WordUpsertSchema,
) {
    let db = database().await;

    let entry = entry_service::create(&db, create_language_payload)
        .await
        .unwrap();
    let id = entry.id;

    create_word_payload.language_id = Some(id);
    upsert_word(&db, &create_word_payload).await.unwrap();

    let words = word_manager::get_all_for_language(&db, id, None)
        .await
        .unwrap();
    assert_eq!(words.len(), 1);

    let response = entry_service::delete(&db, entry.id).await;

    assert!(response.is_ok());

    let entry = language_manager::get(&db, entry.id).await;
    assert!(entry.is_ok());

    let entry = entry.unwrap();
    assert!(entry.is_none());

    let words = word_manager::get_all_for_language(&db, id, None)
        .await
        .unwrap();
    assert_eq!(words.len(), 0);
}
