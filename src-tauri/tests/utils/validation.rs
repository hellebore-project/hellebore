use hellebore::{
    schema::{
        entry::{EntryInfoResponseSchema, EntryProperties, PolymorphicEntryPropertyResponseSchema},
        language::LanguageSchema,
        person::PersonSchema,
    },
    types::entity::EntityType,
};

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
    response: &PolymorphicEntryPropertyResponseSchema,
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

fn _validate_language_properties(language: &LanguageSchema) {
    // TODO: add validation logic once the Language entity has properties
}

pub fn validate_person_property_response(
    response: &PolymorphicEntryPropertyResponseSchema,
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
