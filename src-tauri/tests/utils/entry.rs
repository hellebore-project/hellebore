use hellebore::schema::entry::EntryInfoResponseSchema;

pub fn validate_entry_info_response(
    response: &EntryInfoResponseSchema,
    id: Option<i32>,
    folder_id: i32,
    title: &str,
) {
    if id.is_some() {
        assert_eq!(id.unwrap(), response.id);
    }
    assert_eq!(folder_id, response.folder_id);
    assert_eq!(title, response.title);
}
