use rstest::*;

use hellebore::{
    schema::{
        entry::{EntryCreateSchema, EntryProperties},
        person::PersonSchema,
    },
    types::entity::PERSON,
};

use crate::fixtures::entry::create_entry_payload;

#[fixture]
pub fn person_name() -> String {
    "John Doe".to_string()
}

#[fixture]
pub fn person_properties(person_name: String) -> PersonSchema {
    PersonSchema { name: person_name }
}

#[fixture]
pub fn create_person_payload(
    mut create_entry_payload: EntryCreateSchema,
    person_name: String,
    person_properties: PersonSchema,
) -> EntryCreateSchema {
    create_entry_payload.entity_type = PERSON;
    create_entry_payload.title = person_name.to_string();
    create_entry_payload.properties = EntryProperties::Person(person_properties);
    create_entry_payload
}
