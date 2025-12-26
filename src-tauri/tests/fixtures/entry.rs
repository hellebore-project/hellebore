use hellebore::{
    schema::{
        entry::{EntryCreateSchema, EntryProperties, EntryUpdateSchema},
        language::LanguageSchema,
    },
    types::entity::EntityType,
};
use rstest::*;

use crate::fixtures::folder::folder_id;

#[fixture]
pub fn entry_title() -> String {
    "Entry".to_string()
}

#[fixture]
pub fn entry_properties() -> EntryProperties {
    EntryProperties::Language(LanguageSchema {})
}

#[fixture]
pub fn entry_text() -> String {
    "".to_string()
}

#[fixture]
pub fn create_entry_payload(
    folder_id: i32,
    entry_title: String,
    entry_properties: EntryProperties,
) -> EntryCreateSchema {
    EntryCreateSchema {
        entity_type: EntityType::Entry,
        folder_id,
        title: entry_title,
        properties: entry_properties,
    }
}

#[fixture]
pub fn update_entry_payload() -> EntryUpdateSchema {
    EntryUpdateSchema {
        id: 0,
        folder_id: None,
        title: None,
        properties: None,
        text: None,
        words: None,
    }
}
