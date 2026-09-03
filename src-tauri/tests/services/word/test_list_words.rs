use rstest::*;

use hellebore::{
    schema::{
        PaginationRequestSchema,
        entry::EntryCreateSchema,
        word::{WordListRequestSchema, WordUpsertSchema},
    },
    services::{entry_service, word_service},
    types::grammar_types::WordType,
};

use crate::{
    fixtures::{database, language::create_language_payload},
    utils::{db::upsert_word, validation::validate_word_response},
};

#[fixture]
pub fn list_word_payload() -> PaginationRequestSchema<WordListRequestSchema> {
    PaginationRequestSchema {
        data: WordListRequestSchema {
            language_id: None,
            word_types: None,
            keyword: None,
        },
        page_index: 0,
        offset: None,
        limit: None,
        include_total: true,
    }
}

#[rstest]
#[tokio::test]
async fn test_get_all_words_for_a_language(
    create_language_payload: EntryCreateSchema,
    mut list_word_payload: PaginationRequestSchema<WordListRequestSchema>,
) {
    let db = database().await;
    let language = entry_service::create(&db, create_language_payload)
        .await
        .unwrap();

    let create_payload_1 = WordUpsertSchema {
        language_id: Some(language.id),
        word_type: Some(WordType::Noun),
        spelling: Some("rue".to_owned()),
        translations: Some(vec!["road".to_owned()]),
        ..Default::default()
    };
    let id_1 = upsert_word(&db, &create_payload_1).await.unwrap();

    let create_payload_2 = WordUpsertSchema {
        language_id: Some(language.id),
        word_type: Some(WordType::Verb),
        spelling: Some("conduire".to_owned()),
        translations: Some(vec!["drive".to_owned()]),
        ..Default::default()
    };
    let id_2 = upsert_word(&db, &create_payload_2).await.unwrap();

    list_word_payload.data.language_id = Some(language.id);

    let response = word_service::list(&db, Some(list_word_payload)).await;

    assert!(response.is_ok());

    let mut words = response.unwrap().items;
    words.sort_by_key(|w| w.spelling.clone());
    words.reverse();

    let mut expected_response_1 = create_payload_1.to_response();
    expected_response_1.id = id_1;
    expected_response_1.language_id = language.id;

    let mut expected_response_2 = create_payload_2.to_response();
    expected_response_2.id = id_2;
    expected_response_2.language_id = language.id;

    validate_word_response(&words[0], &expected_response_1);
    validate_word_response(&words[1], &expected_response_2);
}

#[rstest]
#[tokio::test]
async fn test_list_words_without_filters(
    create_language_payload: EntryCreateSchema,
    mut list_word_payload: PaginationRequestSchema<WordListRequestSchema>,
) {
    let db = database().await;
    let language = entry_service::create(&db, create_language_payload)
        .await
        .unwrap();

    let create_payload_1 = WordUpsertSchema {
        language_id: Some(language.id),
        word_type: Some(WordType::Noun),
        spelling: Some("rue".to_owned()),
        translations: Some(vec!["road".to_owned()]),
        ..Default::default()
    };
    let id_1 = upsert_word(&db, &create_payload_1).await.unwrap();

    let create_payload_2 = WordUpsertSchema {
        language_id: Some(language.id),
        word_type: Some(WordType::Verb),
        spelling: Some("conduire".to_owned()),
        translations: Some(vec!["drive".to_owned()]),
        ..Default::default()
    };
    let id_2 = upsert_word(&db, &create_payload_2).await.unwrap();

    list_word_payload.data.language_id = Some(language.id);
    list_word_payload.data.word_types = None;
    list_word_payload.data.keyword = None;

    let response = word_service::list(&db, Some(list_word_payload)).await;
    assert!(response.is_ok());

    let mut words = response.unwrap().items;
    words.sort_by_key(|w| w.spelling.clone());
    words.reverse();

    let mut expected_response_1 = create_payload_1.to_response();
    expected_response_1.id = id_1;
    expected_response_1.language_id = language.id;

    let mut expected_response_2 = create_payload_2.to_response();
    expected_response_2.id = id_2;
    expected_response_2.language_id = language.id;

    validate_word_response(&words[0], &expected_response_1);
    validate_word_response(&words[1], &expected_response_2);
}

#[rstest]
#[tokio::test]
async fn test_list_words_with_exact_spelling_match(
    create_language_payload: EntryCreateSchema,
    mut list_word_payload: PaginationRequestSchema<WordListRequestSchema>,
) {
    let db = database().await;
    let language = entry_service::create(&db, create_language_payload)
        .await
        .unwrap();

    let create_payload = WordUpsertSchema {
        language_id: Some(language.id),
        word_type: Some(WordType::Verb),
        spelling: Some("conduire".to_owned()),
        translations: Some(vec!["drive".to_owned()]),
        ..Default::default()
    };
    let id = upsert_word(&db, &create_payload).await.unwrap();

    list_word_payload.data.language_id = Some(language.id);
    list_word_payload.data.keyword = Some("conduire".to_owned());
    list_word_payload.data.word_types = None;

    let results = word_service::list(&db, Some(list_word_payload)).await;
    assert!(results.is_ok());

    let results = results.unwrap();
    assert_eq!(results.items.len(), 1);
    assert_eq!(results.items[0].id, id);
    assert_eq!(results.items[0].spelling, "conduire");
}

#[rstest]
#[tokio::test]
async fn test_list_words_with_word_type_filter(
    create_language_payload: EntryCreateSchema,
    mut list_word_payload: PaginationRequestSchema<WordListRequestSchema>,
) {
    let db = database().await;
    let language = entry_service::create(&db, create_language_payload)
        .await
        .unwrap();

    let noun = WordUpsertSchema {
        language_id: Some(language.id),
        word_type: Some(WordType::Noun),
        spelling: Some("rue".to_owned()),
        translations: Some(vec!["road".to_owned()]),
        ..Default::default()
    };
    upsert_word(&db, &noun).await.unwrap();

    let verb = WordUpsertSchema {
        language_id: Some(language.id),
        word_type: Some(WordType::Verb),
        spelling: Some("conduire".to_owned()),
        translations: Some(vec!["drive".to_owned()]),
        ..Default::default()
    };
    let id = upsert_word(&db, &verb).await.unwrap();

    list_word_payload.data.language_id = Some(language.id);
    list_word_payload.data.word_types = Some(vec![WordType::Verb]);
    list_word_payload.data.keyword = None;

    let results = word_service::list(&db, Some(list_word_payload)).await;
    assert!(results.is_ok());

    let results = results.unwrap();
    assert_eq!(results.items.len(), 1);
    assert_eq!(results.items[0].id, id);
    assert_eq!(results.items[0].word_type, WordType::Verb);
}

#[rstest]
#[tokio::test]
async fn test_list_words_with_empty_keyword_matches_all_entries(
    create_language_payload: EntryCreateSchema,
    mut list_word_payload: PaginationRequestSchema<WordListRequestSchema>,
) {
    let db = database().await;
    let language = entry_service::create(&db, create_language_payload)
        .await
        .unwrap();

    let words = vec![
        WordUpsertSchema {
            language_id: Some(language.id),
            word_type: Some(WordType::Noun),
            spelling: Some("rue".to_owned()),
            translations: Some(vec!["road".to_owned()]),
            ..Default::default()
        },
        WordUpsertSchema {
            language_id: Some(language.id),
            word_type: Some(WordType::Verb),
            spelling: Some("conduire".to_owned()),
            translations: Some(vec!["drive".to_owned()]),
            ..Default::default()
        },
        WordUpsertSchema {
            language_id: Some(language.id),
            word_type: Some(WordType::Adjective),
            spelling: Some("courant".to_owned()),
            translations: Some(vec!["current".to_owned()]),
            ..Default::default()
        },
    ];

    for word in words {
        upsert_word(&db, &word).await.unwrap();
    }

    list_word_payload.data.language_id = Some(language.id);
    list_word_payload.data.keyword = Some("".to_owned());
    list_word_payload.data.word_types = None;

    let results = word_service::list(&db, Some(list_word_payload)).await;
    assert!(results.is_ok());

    let results = results.unwrap();
    assert_eq!(results.items.len(), 3);
    assert!(results.total.is_some());
    assert_eq!(results.total, Some(3));
}

#[rstest]
#[tokio::test]
async fn test_list_words_omits_total_when_include_total_is_false(
    create_language_payload: EntryCreateSchema,
    mut list_word_payload: PaginationRequestSchema<WordListRequestSchema>,
) {
    let db = database().await;
    let language = entry_service::create(&db, create_language_payload)
        .await
        .unwrap();

    for spelling in ["rue", "conduire", "courant", "aller"] {
        let word = WordUpsertSchema {
            language_id: Some(language.id),
            word_type: Some(WordType::Noun),
            spelling: Some(spelling.to_owned()),
            translations: Some(vec![spelling.to_owned()]),
            ..Default::default()
        };
        upsert_word(&db, &word).await.unwrap();
    }

    list_word_payload.data.language_id = Some(language.id);
    list_word_payload.data.keyword = None;
    list_word_payload.data.word_types = None;
    list_word_payload.offset = Some(1);
    list_word_payload.limit = Some(2);
    list_word_payload.include_total = false;

    let results = word_service::list(&db, Some(list_word_payload)).await;
    assert!(results.is_ok());

    let results = results.unwrap();
    assert_eq!(results.items.len(), 2);
    assert_eq!(results.page_index, 1);
    assert_eq!(results.item_count, 2);
    assert_eq!(results.total, None);
    assert_eq!(results.page_count, None);
}

#[rstest]
#[tokio::test]
async fn test_list_words_with_limit_and_offset(
    create_language_payload: EntryCreateSchema,
    mut list_word_payload: PaginationRequestSchema<WordListRequestSchema>,
) {
    let db = database().await;
    let language = entry_service::create(&db, create_language_payload)
        .await
        .unwrap();

    for spelling in ["rue", "conduire", "courant", "aller", "voyage"] {
        let word = WordUpsertSchema {
            language_id: Some(language.id),
            word_type: Some(WordType::Noun),
            spelling: Some(spelling.to_owned()),
            translations: Some(vec![spelling.to_owned()]),
            ..Default::default()
        };
        upsert_word(&db, &word).await.unwrap();
    }

    list_word_payload.data.language_id = Some(language.id);
    list_word_payload.data.keyword = None;
    list_word_payload.data.word_types = None;
    list_word_payload.offset = Some(2);
    list_word_payload.limit = Some(2);
    list_word_payload.include_total = true;

    let results = word_service::list(&db, Some(list_word_payload)).await;
    assert!(results.is_ok());

    let results = results.unwrap();
    assert_eq!(results.items.len(), 2);
    assert_eq!(results.page_index, 1);
    assert_eq!(results.item_count, 2);
    assert_eq!(results.total, Some(5));
    assert_eq!(results.page_count, Some(3));
}
