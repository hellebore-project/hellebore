use crate::fixtures::{database, folder::folder_id, settings};
use crate::utils::entry::validate_entry_info_response;

use hellebore::database::folder_manager::ROOT_FOLDER_ID;
use hellebore::schema::entry::{EntryPropertyResponseSchema, EntryUpdateSchema};
use hellebore::types::entity::PERSON;
use hellebore::{
    schema::{entry::EntryCreateSchema, person::PersonDataSchema},
    services::person_service,
    settings::Settings,
};
use rstest::*;

fn validate_person_response(
    response: &EntryPropertyResponseSchema<PersonDataSchema>,
    id: Option<i32>,
    name: &str,
) {
    validate_entry_info_response(&response.info, id, ROOT_FOLDER_ID, PERSON, name);
    assert_eq!(name, response.properties.name);
}

#[fixture]
fn name() -> String {
    "John Doe".to_string()
}

#[fixture]
fn create_payload(folder_id: i32, name: String) -> EntryCreateSchema<PersonDataSchema> {
    let person = PersonDataSchema { name };
    EntryCreateSchema {
        folder_id,
        title: person.name.to_string(),
        data: person,
    }
}

#[fixture]
fn update_payload() -> EntryUpdateSchema<PersonDataSchema> {
    EntryUpdateSchema {
        id: 0,
        data: PersonDataSchema {
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
    create_payload: EntryCreateSchema<PersonDataSchema>,
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
    create_payload: EntryCreateSchema<PersonDataSchema>,
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
    create_payload: EntryCreateSchema<PersonDataSchema>,
    mut update_payload: hellebore::schema::entry::EntryUpdateSchema<PersonDataSchema>,
) {
    let database = database(settings).await;
    let entry = person_service::create(&database, create_payload)
        .await
        .unwrap();

    update_payload.id = entry.id;
    update_payload.data.name = "Jane Doe".to_owned();
    let response = person_service::update(&database, update_payload).await;

    assert!(response.is_ok());

    let person = person_service::get(&database, entry.id).await;

    assert!(person.is_ok());
    validate_person_response(&person.unwrap(), Some(entry.id), "Jane Doe");
}

#[rstest]
#[tokio::test]
async fn test_error_on_updating_nonexistent_person(
    settings: &Settings,
    update_payload: EntryUpdateSchema<PersonDataSchema>,
) {
    let database = database(settings).await;
    let response = person_service::update(&database, update_payload).await;
    assert!(response.is_err());
}

#[rstest]
#[tokio::test]
async fn test_get_person(
    settings: &Settings,
    name: String,
    create_payload: EntryCreateSchema<PersonDataSchema>,
) {
    let database = database(settings).await;
    let entry = person_service::create(&database, create_payload)
        .await
        .unwrap();

    let person = person_service::get(&database, entry.id).await;

    assert!(person.is_ok());
    validate_person_response(&person.unwrap(), Some(entry.id), &name);
}

#[rstest]
#[tokio::test]
async fn test_error_on_getting_nonexistent_person(settings: &Settings) {
    let database = database(settings).await;
    let response = person_service::get(&database, 0).await;
    assert!(response.is_err());
}

#[rstest]
#[tokio::test]
async fn test_delete_person(
    settings: &Settings,
    create_payload: EntryCreateSchema<PersonDataSchema>,
) {
    let database = database(settings).await;
    let entry = person_service::create(&database, create_payload)
        .await
        .unwrap();

    let response = person_service::delete(&database, entry.id).await;

    assert!(response.is_ok());

    let entry = person_service::get(&database, entry.id).await;
    assert!(entry.is_err());
}

#[rstest]
#[tokio::test]
async fn test_noop_on_deleting_nonexistent_person(settings: &Settings) {
    let database = database(settings).await;
    let response = person_service::delete(&database, 0).await;
    assert!(response.is_ok());
}
