use crate::fixtures::{
    database,
    language::create_language_payload,
    settings,
    word::{create_word_payload, expected_word_response},
};

use hellebore::{
    schema::{
        entry::EntryCreateSchema,
        language::LanguageSchema,
        word::{WordResponseSchema, WordUpdateSchema},
    },
    services::{language_service, word_service},
    settings::Settings,
    types::grammar::{GrammaticalGender, VerbForm, WordType},
    utils::CodedEnum,
};
use rstest::*;

fn validate_word_response(actual: &WordResponseSchema, expected: &WordResponseSchema) {
    assert_eq!(expected.id, actual.id);
    assert_eq!(expected.language_id, actual.language_id);
    assert_eq!(expected.word_type.code(), actual.word_type.code());
    assert_eq!(expected.spelling, actual.spelling);
    assert_eq!(expected.translations, actual.translations);
    assert_eq!(expected.number.code(), actual.number.code());
    assert_eq!(expected.person.code(), actual.person.code());
    assert_eq!(expected.gender.code(), actual.gender.code());
    assert_eq!(expected.verb_form.code(), actual.verb_form.code());
    assert_eq!(expected.verb_tense.code(), actual.verb_tense.code());
}

#[rstest]
#[tokio::test]
async fn test_create_word(
    settings: &Settings,
    create_language_payload: EntryCreateSchema<LanguageSchema>,
    mut create_word_payload: WordUpdateSchema,
    mut expected_word_response: WordResponseSchema,
) {
    let database = database(settings).await;
    let language = language_service::create(&database, create_language_payload)
        .await
        .unwrap();

    create_word_payload.language_id = Some(language.id);
    let word = word_service::create(&database, create_word_payload.clone()).await;

    assert!(word.is_ok());
    let word = word.unwrap();
    expected_word_response.id = word.id;
    expected_word_response.language_id = word.language_id;
    validate_word_response(&word, &expected_word_response);
}

#[rstest]
#[tokio::test]
async fn test_create_duplicate_word(
    settings: &Settings,
    create_language_payload: EntryCreateSchema<LanguageSchema>,
    mut create_word_payload: WordUpdateSchema,
) {
    let database = database(settings).await;
    let language = language_service::create(&database, create_language_payload)
        .await
        .unwrap();
    create_word_payload.language_id = Some(language.id);
    let _ = word_service::create(&database, create_word_payload.clone()).await;

    let response = word_service::create(&database, create_word_payload).await;

    assert!(response.is_ok());
}

#[rstest]
#[tokio::test]
async fn test_update_word(
    settings: &Settings,
    mut create_word_payload: WordUpdateSchema,
    create_language_payload: EntryCreateSchema<LanguageSchema>,
    mut expected_word_response: WordResponseSchema,
) {
    let database = database(settings).await;
    let language = language_service::create(&database, create_language_payload)
        .await
        .unwrap();
    create_word_payload.language_id = Some(language.id);
    let word = word_service::create(&database, create_word_payload)
        .await
        .unwrap();

    let new_spelling = "conducteur";
    let new_translations = vec!["driver".to_owned(), "conductor".to_owned()];
    let update_payload = WordUpdateSchema {
        id: Some(word.id),
        language_id: None,
        word_type: None,
        spelling: Some(new_spelling.to_owned()),
        translations: Some(new_translations.clone()),
        number: None,
        person: None,
        gender: Some(GrammaticalGender::Masculine),
        verb_form: None,
        verb_tense: None,
    };
    let response = word_service::update(&database, update_payload.clone()).await;

    assert!(response.is_ok());
    let response = response.unwrap();
    assert!(response.errors.is_empty());

    let word = word_service::get(&database, word.id).await;

    assert!(word.is_ok());
    let word = word.unwrap();

    expected_word_response.id = word.id;
    expected_word_response.language_id = word.language_id;
    expected_word_response.spelling = new_spelling.to_owned();
    expected_word_response.translations = new_translations;
    expected_word_response.gender = GrammaticalGender::Masculine;

    validate_word_response(&word, &expected_word_response);
}

#[rstest]
#[tokio::test]
async fn test_error_on_updating_nonexistent_word(
    settings: &Settings,
    create_language_payload: EntryCreateSchema<LanguageSchema>,
) {
    let database = database(settings).await;
    let language = language_service::create(&database, create_language_payload)
        .await
        .unwrap();

    let new_spelling = "conducteur";
    let new_translations = vec!["driver".to_owned(), "conductor".to_owned()];
    let update_payload = WordUpdateSchema {
        id: Some(1),
        language_id: Some(language.id),
        word_type: None,
        spelling: Some(new_spelling.to_owned()),
        translations: Some(new_translations.clone()),
        number: None,
        person: None,
        gender: Some(GrammaticalGender::Masculine),
        verb_form: None,
        verb_tense: None,
    };
    let response = word_service::update(&database, update_payload.clone()).await;

    assert!(response.is_ok());
    let response = response.unwrap();
    assert!(!response.errors.is_empty())
}

#[rstest]
#[tokio::test]
async fn test_get_word(
    settings: &Settings,
    create_language_payload: EntryCreateSchema<LanguageSchema>,
    mut create_word_payload: WordUpdateSchema,
    mut expected_word_response: WordResponseSchema,
) {
    let database = database(settings).await;
    let language = language_service::create(&database, create_language_payload)
        .await
        .unwrap();

    create_word_payload.language_id = Some(language.id);
    let created_word = word_service::create(&database, create_word_payload.clone())
        .await
        .unwrap();

    let word = word_service::get(&database, created_word.id).await;

    assert!(word.is_ok());
    let word = word.unwrap();

    expected_word_response.id = created_word.id;
    expected_word_response.language_id = language.id;

    validate_word_response(&word, &expected_word_response);
}

#[rstest]
#[tokio::test]
async fn test_error_on_getting_nonexistent_word(settings: &Settings) {
    let database = database(settings).await;
    let response = word_service::get(&database, 0).await;
    assert!(response.is_err());
}

#[rstest]
#[tokio::test]
async fn test_get_all_words_for_a_language(
    settings: &Settings,
    create_language_payload: EntryCreateSchema<LanguageSchema>,
) {
    let database = database(settings).await;
    let language = language_service::create(&database, create_language_payload)
        .await
        .unwrap();

    let create_payload_1 = WordUpdateSchema {
        language_id: Some(language.id),
        word_type: Some(WordType::Noun),
        spelling: Some("rue".to_owned()),
        translations: Some(vec!["road".to_owned()]),
        gender: Some(GrammaticalGender::Feminine),
        ..Default::default()
    };
    let created_word_1 = word_service::create(&database, create_payload_1.clone())
        .await
        .unwrap();

    let create_payload_2 = WordUpdateSchema {
        language_id: Some(language.id),
        word_type: Some(WordType::Verb),
        spelling: Some("conduire".to_owned()),
        translations: Some(vec!["drive".to_owned()]),
        verb_form: Some(VerbForm::Infinitive),
        ..Default::default()
    };
    let created_word_2 = word_service::create(&database, create_payload_2.clone())
        .await
        .unwrap();

    let words = word_service::get_all_for_language(&database, language.id, None).await;

    assert!(words.is_ok());
    let mut words = words.unwrap();
    words.sort_by(|a, b| a.id.cmp(&b.id));

    let mut expected_response_1 = create_payload_1.to_response();
    expected_response_1.id = created_word_1.id;
    expected_response_1.language_id = language.id;

    let mut expected_response_2 = create_payload_2.to_response();
    expected_response_2.id = created_word_2.id;
    expected_response_2.language_id = language.id;

    validate_word_response(&words[0], &expected_response_1);
    validate_word_response(&words[1], &expected_response_2);
}

#[rstest]
#[tokio::test]
async fn test_delete_word(
    settings: &Settings,
    create_language_payload: EntryCreateSchema<LanguageSchema>,
    mut create_word_payload: WordUpdateSchema,
) {
    let database = database(settings).await;
    let language = language_service::create(&database, create_language_payload)
        .await
        .unwrap();

    create_word_payload.language_id = Some(language.id);
    let created_word = word_service::create(&database, create_word_payload.clone())
        .await
        .unwrap();

    let response = word_service::delete(&database, created_word.id).await;

    assert!(response.is_ok());
}

#[rstest]
#[tokio::test]
async fn test_error_on_deleting_nonexistent_word(settings: &Settings) {
    let database = database(settings).await;
    let response = word_service::delete(&database, 0).await;
    assert!(response.is_err());
}
