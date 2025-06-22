use crate::fixtures::{database, folder_id, settings};
use crate::utils::validate_article_info_response;

use hellebore::schema::entity::{EntityResponseSchema, EntityUpdateSchema};
use hellebore::{
    schema::{article::ArticleCreateSchema, person::PersonDataSchema},
    services::person_service,
    settings::Settings,
};
use rstest::*;

fn validate_person_response(
    person: &EntityResponseSchema<PersonDataSchema>,
    id: Option<i32>,
    name: &str,
) {
    if id.is_some() {
        assert_eq!(id.unwrap(), person.id);
    }
    assert_eq!(name, person.data.name);
}

#[fixture]
fn name() -> String {
    "John Doe".to_string()
}

#[fixture]
fn create_payload(folder_id: i32, name: String) -> ArticleCreateSchema<PersonDataSchema> {
    let person = PersonDataSchema { name };
    ArticleCreateSchema {
        folder_id,
        title: person.name.to_string(),
        data: person,
    }
}

#[fixture]
fn update_payload() -> EntityUpdateSchema<PersonDataSchema> {
    EntityUpdateSchema {
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
    create_payload: ArticleCreateSchema<PersonDataSchema>,
) {
    let database = database(settings).await;
    let article = person_service::create(&database, create_payload).await;

    assert!(article.is_ok());
    validate_article_info_response(&article.unwrap(), None, folder_id, &name);
}

#[rstest]
#[tokio::test]
async fn test_error_on_creating_duplicate_person(
    settings: &Settings,
    create_payload: ArticleCreateSchema<PersonDataSchema>,
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
    create_payload: ArticleCreateSchema<PersonDataSchema>,
    mut update_payload: hellebore::schema::entity::EntityUpdateSchema<PersonDataSchema>,
) {
    let database = database(settings).await;
    let article = person_service::create(&database, create_payload)
        .await
        .unwrap();

    update_payload.id = article.id;
    update_payload.data.name = "Jane Doe".to_owned();
    let response = person_service::update(&database, update_payload).await;

    assert!(response.is_ok());

    let person = person_service::get(&database, article.id).await;

    assert!(person.is_ok());
    validate_person_response(&person.unwrap(), Some(article.id), "Jane Doe");
}

#[rstest]
#[tokio::test]
async fn test_error_on_updating_nonexistent_person(
    settings: &Settings,
    update_payload: EntityUpdateSchema<PersonDataSchema>,
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
    create_payload: ArticleCreateSchema<PersonDataSchema>,
) {
    let database = database(settings).await;
    let article = person_service::create(&database, create_payload)
        .await
        .unwrap();

    let person = person_service::get(&database, article.id).await;

    assert!(person.is_ok());
    validate_person_response(&person.unwrap(), Some(article.id), &name);
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
    create_payload: ArticleCreateSchema<PersonDataSchema>,
) {
    let database = database(settings).await;
    let article = person_service::create(&database, create_payload)
        .await
        .unwrap();

    let response = person_service::delete(&database, article.id).await;

    assert!(response.is_ok());

    let article = person_service::get(&database, article.id).await;
    assert!(article.is_err());
}

#[rstest]
#[tokio::test]
async fn test_error_on_deleting_nonexistent_person(settings: &Settings) {
    let database = database(settings).await;
    let response = person_service::delete(&database, 0).await;
    assert!(response.is_err());
}
