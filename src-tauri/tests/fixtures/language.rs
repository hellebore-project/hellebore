use rstest::*;

use hellebore::schema::{entry::EntryCreateSchema, language::LanguageSchema};

use crate::fixtures::folder::folder_id;

#[fixture]
pub fn language_name() -> String {
    return "French".to_string();
}

#[fixture]
pub fn create_language_payload(
    folder_id: i32,
    language_name: String,
) -> EntryCreateSchema<LanguageSchema> {
    let language = LanguageSchema {
        name: language_name,
    };
    EntryCreateSchema {
        folder_id,
        title: language.name.to_string(),
        properties: language,
    }
}
