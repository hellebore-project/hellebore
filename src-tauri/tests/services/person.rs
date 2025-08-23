use crate::fixtures::{database, folder::folder_id, settings};
use crate::utils::validation::{validate_entry_info_response, validate_person_property_response};

use hellebore::schema::entry::EntryUpdateSchema;
use hellebore::services::entry_service;
use hellebore::types::entity::PERSON;
use hellebore::{
    schema::{entry::EntryCreateSchema, person::PersonSchema},
    services::person_service,
    settings::Settings,
};
use rstest::*;

#[fixture]
fn name() -> String {
    "John Doe".to_string()
}

#[fixture]
fn create_payload(folder_id: i32, name: String) -> EntryCreateSchema<PersonSchema> {
    let person = PersonSchema { name };
    EntryCreateSchema {
        folder_id,
        title: person.name.to_string(),
        properties: person,
    }
}

#[fixture]
fn update_payload() -> EntryUpdateSchema<PersonSchema> {
    EntryUpdateSchema {
        id: 0,
        properties: PersonSchema {
            name: "".to_owned(),
        },
    }
}

#[rstest]
#[tokio::test]
async fn test_create_person(
    settings: &Settings,
    folder_id: i32,
    name: String,
    create_payload: EntryCreateSchema<PersonSchema>,
) {
    let database = database(settings).await;
    let entry = person_service::create(&database, create_payload).await;

    assert!(entry.is_ok());
    validate_entry_info_response(&entry.unwrap(), None, folder_id, PERSON, &name);
}

#[rstest]
#[tokio::test]
async fn test_error_on_creating_duplicate_person(
    settings: &Settings,
    create_payload: EntryCreateSchema<PersonSchema>,
) {
    let database = database(settings).await;
    let _ = person_service::create(&database, create_payload.clone()).await;
    let response = person_service::create(&database, create_payload).await;
    assert!(response.is_err());
}

#[rstest]
#[tokio::test]
async fn test_update_person(
    settings: &Settings,
    folder_id: i32,
    name: String,
    create_payload: EntryCreateSchema<PersonSchema>,
    mut update_payload: hellebore::schema::entry::EntryUpdateSchema<PersonSchema>,
) {
    let database = database(settings).await;
    let entry = person_service::create(&database, create_payload)
        .await
        .unwrap();

    update_payload.id = entry.id;
    update_payload.properties.name = "John D. Doe".to_owned();
    let response = person_service::update(&database, update_payload).await;

    assert!(response.is_ok());

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
    update_payload: EntryUpdateSchema<PersonSchema>,
) {
    let database = database(settings).await;
    let response = person_service::update(&database, update_payload).await;
    assert!(response.is_err());
}

#[rstest]
#[tokio::test]
async fn test_get_person(
    settings: &Settings,
    folder_id: i32,
    name: String,
    create_payload: EntryCreateSchema<PersonSchema>,
) {
    let database = database(settings).await;
    let entry = person_service::create(&database, create_payload)
        .await
        .unwrap();

    let person = entry_service::get_properties(&database, entry.id).await;

    assert!(person.is_ok());
    let person = person.unwrap();

    validate_person_property_response(&person, Some(entry.id), folder_id, PERSON, &name, &name);
}

#[rstest]
#[tokio::test]
async fn test_delete_person(settings: &Settings, create_payload: EntryCreateSchema<PersonSchema>) {
    let database = database(settings).await;
    let entry = person_service::create(&database, create_payload)
        .await
        .unwrap();

    let response = entry_service::delete(&database, entry.id).await;

    assert!(response.is_ok());

    let entry = person_service::get(&database, entry.id).await;
    assert!(entry.is_err());
}
