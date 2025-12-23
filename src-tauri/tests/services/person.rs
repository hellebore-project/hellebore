use crate::fixtures::{database, folder::folder_id, settings};
use crate::utils::validation::{validate_entry_info_response, validate_person_property_response};

use hellebore::{
    schema::{
        entry::{EntryCreateSchema, EntryProperties, EntryUpdateSchema},
        person::PersonSchema,
    },
    services::{entry_service, person_service},
    settings::Settings,
    types::entity::PERSON,
};
use rstest::*;

#[fixture]
fn name() -> String {
    "John Doe".to_string()
}

#[fixture]
fn properties(name: String) -> PersonSchema {
    PersonSchema { name }
}

#[fixture]
fn create_payload(folder_id: i32, name: String, properties: PersonSchema) -> EntryCreateSchema {
    EntryCreateSchema {
        folder_id,
        entity_type: PERSON,
        title: name.to_string(),
        properties: EntryProperties::Person(properties),
    }
}

#[fixture]
fn update_payload(properties: PersonSchema) -> EntryUpdateSchema {
    EntryUpdateSchema {
        id: 0,
        folder_id: None,
        title: None,
        properties: Some(EntryProperties::Person(properties)),
        text: None,
    }
}

#[rstest]
#[tokio::test]
async fn test_create_person(
    settings: &Settings,
    folder_id: i32,
    name: String,
    create_payload: EntryCreateSchema,
) {
    let database = database(settings).await;
    let entry = entry_service::create(&database, create_payload).await;

    assert!(entry.is_ok());
    validate_entry_info_response(&entry.unwrap(), None, folder_id, PERSON, &name);
}

#[rstest]
#[tokio::test]
async fn test_error_on_creating_duplicate_person(
    settings: &Settings,
    create_payload: EntryCreateSchema,
) {
    let database = database(settings).await;
    let _ = entry_service::create(&database, create_payload.clone()).await;
    let response = entry_service::create(&database, create_payload).await;
    assert!(response.is_err());
}

#[rstest]
#[tokio::test]
async fn test_update_person(
    settings: &Settings,
    folder_id: i32,
    name: String,
    create_payload: EntryCreateSchema,
    mut properties: PersonSchema,
    mut update_payload: hellebore::schema::entry::EntryUpdateSchema,
) {
    let database = database(settings).await;
    let entry = entry_service::create(&database, create_payload)
        .await
        .unwrap();

    update_payload.id = entry.id;

    properties.name = "John D. Doe".to_owned();
    update_payload.properties = Some(EntryProperties::Person(properties));

    let response = entry_service::update(&database, update_payload).await;

    assert!(response.errors.is_empty());

    let person = entry_service::get_properties(&database, entry.id).await;

    assert!(person.is_ok());
    let person = person.unwrap();

    validate_person_property_response(
        &person,
        Some(entry.id),
        folder_id,
        PERSON,
        &name,
        "John D. Doe",
    );
}

#[rstest]
#[tokio::test]
async fn test_error_on_updating_nonexistent_person(
    settings: &Settings,
    update_payload: EntryUpdateSchema,
) {
    let database = database(settings).await;
    let response = entry_service::update(&database, update_payload).await;
    assert!(response.errors.len() > 0);
}

#[rstest]
#[tokio::test]
async fn test_get_person(
    settings: &Settings,
    folder_id: i32,
    name: String,
    create_payload: EntryCreateSchema,
) {
    let database = database(settings).await;
    let entry = entry_service::create(&database, create_payload)
        .await
        .unwrap();

    let person = entry_service::get_properties(&database, entry.id).await;

    assert!(person.is_ok());
    let person = person.unwrap();

    validate_person_property_response(&person, Some(entry.id), folder_id, PERSON, &name, &name);
}

#[rstest]
#[tokio::test]
async fn test_delete_person(settings: &Settings, create_payload: EntryCreateSchema) {
    let database = database(settings).await;
    let entry = entry_service::create(&database, create_payload)
        .await
        .unwrap();

    let response = entry_service::delete(&database, entry.id).await;

    assert!(response.is_ok());

    let entry = person_service::get(&database, entry.id).await;
    assert!(entry.is_err());
}
