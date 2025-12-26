use rstest::*;

use hellebore::{
    schema::{
        entry::{EntryCreateSchema, EntryProperties},
        language::LanguageSchema,
    },
    types::entity::LANGUAGE,
};

use crate::fixtures::entry::create_entry_payload;

#[fixture]
pub fn language_name() -> String {
    "French".to_string()
}

#[fixture]
pub fn language_properties() -> LanguageSchema {
    LanguageSchema {}
}

#[fixture]
pub fn create_language_payload(
    mut create_entry_payload: EntryCreateSchema,
    language_name: String,
    language_properties: LanguageSchema,
) -> EntryCreateSchema {
    create_entry_payload.entity_type = LANGUAGE;
    create_entry_payload.title = language_name.to_string();
    create_entry_payload.properties = EntryProperties::Language(language_properties);
    create_entry_payload
}
