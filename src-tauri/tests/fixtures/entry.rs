use hellebore::schema::entry::EntryUpdateSchema;
use rstest::*;

#[fixture]
pub fn entry_text() -> String {
    return "".to_string();
}

#[fixture]
pub fn update_entry_payload() -> EntryUpdateSchema {
    EntryUpdateSchema {
        id: 0,
        folder_id: None,
        title: None,
        properties: None,
        text: None,
    }
}
