use ::entity::entry::Model as EntryModel;
use hellebore::{
    database::file_manager,
    schema::{
        entry::{EntryInfoResponseSchema, EntryProperties, EntryPropertyResponseSchema},
        language::LanguageSchema,
        person::PersonSchema,
        word::WordResponseSchema,
    },
    types::entity::{ENTRY, EntityType},
    utils::CodedEnum,
};

pub fn validate_entry_model(
    entry: &EntryModel,
    id: Option<i32>,
    folder_id: i32,
    title: &str,
    text: &str,
) {
    if id.is_some() {
        assert_eq!(id.unwrap(), entry.id);
    }
    assert_eq!(
        folder_id,
        file_manager::convert_null_folder_id_to_root(entry.folder_id)
    );
    assert_eq!(title, entry.title);
    assert_eq!(text, entry.text);
}

pub fn validate_generic_entry_info_response(
    entry: &EntryInfoResponseSchema,
    id: Option<i32>,
    folder_id: i32,
    title: &str,
) {
    validate_entry_info_response(entry, id, folder_id, ENTRY, title)
}

pub fn validate_entry_info_response(
    response: &EntryInfoResponseSchema,
    id: Option<i32>,
    folder_id: i32,
    entity_type: EntityType,
    title: &str,
) {
    if id.is_some() {
        assert_eq!(id.unwrap(), response.id);
    }
    assert_eq!(folder_id, response.folder_id);
    assert_eq!(entity_type, response.entity_type);
    assert_eq!(title, response.title);
}

pub fn validate_language_property_response(
    response: &EntryPropertyResponseSchema,
    id: Option<i32>,
    folder_id: i32,
    entity_type: EntityType,
    title: &str,
) {
    validate_entry_info_response(&response.info, id, folder_id, entity_type, title);
    match &response.properties {
        EntryProperties::Language(props) => _validate_language_properties(&props),
        _ => panic!("Got wrong entry type; expected language properties."),
    }
}

fn _validate_language_properties(_language: &LanguageSchema) {
    // TODO: add validation logic once the Language entity has properties
}

pub fn validate_word_response(actual: &WordResponseSchema, expected: &WordResponseSchema) {
    assert_eq!(expected.id, actual.id);
    assert_eq!(expected.language_id, actual.language_id);
    assert_eq!(expected.word_type.code(), actual.word_type.code());
    assert_eq!(expected.spelling, actual.spelling);
    assert_eq!(expected.definition, actual.definition);
    assert_eq!(expected.translations, actual.translations);
}

pub fn validate_person_property_response(
    response: &EntryPropertyResponseSchema,
    id: Option<i32>,
    folder_id: i32,
    entity_type: EntityType,
    title: &str,
    name: &str,
) {
    validate_entry_info_response(&response.info, id, folder_id, entity_type, title);
    match &response.properties {
        EntryProperties::Person(props) => _validate_person_properties(&props, name),
        _ => panic!("Got wrong entry type; expected person properties."),
    }
}

fn _validate_person_properties(person: &PersonSchema, name: &str) {
    assert_eq!(name, person.name);
}
