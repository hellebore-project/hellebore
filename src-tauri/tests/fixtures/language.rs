use rstest::*;

use hellebore::{
    schema::{
        entry::{EntryCreateSchema, EntryProperties},
        language::LanguageSchema,
    },
    types::entity::LANGUAGE,
};

use crate::fixtures::folder::folder_id;

#[fixture]
pub fn language_name() -> String {
    return "French".to_string();
}

#[fixture]
pub fn create_language_payload(folder_id: i32, language_name: String) -> EntryCreateSchema {
    let language = LanguageSchema {};
    EntryCreateSchema {
        folder_id,
        entity_type: LANGUAGE,
        title: language_name.to_string(),
        properties: EntryProperties::Language(language),
    }
}
