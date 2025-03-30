use crate::fixtures::{database, folder_id, settings};
use crate::utils::validate_article_response;

use hellebore::{
    schema::{
        article::{ArticleCreateSchema, ArticleResponseSchema, ArticleUpdateSchema},
        person::PersonDataSchema,
    },
    services::person_service,
    settings::Settings,
    types::PERSON,
};
use rstest::*;

fn validate_person_response(
    article: &ArticleResponseSchema<PersonDataSchema>,
    id: Option<i32>,
    folder_id: i32,
    title: &str,
    name: &str,
) {
    let entity = article.entity.as_ref().unwrap();
    assert_eq!(name, &entity.name);
    validate_article_response(article, id, folder_id, title, "");
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
fn update_payload() -> ArticleUpdateSchema<PersonDataSchema> {
    ArticleUpdateSchema {
        id: 0,
        folder_id: None,
        entity_type: PERSON,
        title: None,
        entity: None,
        body: None,
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
    validate_person_response(&article.unwrap(), None, folder_id, &name, &name);
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
    folder_id: i32,
    create_payload: ArticleCreateSchema<PersonDataSchema>,
    mut update_payload: ArticleUpdateSchema<PersonDataSchema>,
) {
    let database = database(settings).await;
    let article = person_service::create(&database, create_payload)
        .await
        .unwrap();

    update_payload.id = article.id;
    update_payload.title = Some("Jane Doe".to_owned());
    update_payload.entity = Some(PersonDataSchema {
        name: "Jane".to_owned(),
    });
    let response = person_service::update(&database, update_payload).await;

    assert!(response.is_ok());
    let response = response.unwrap();
    assert!(response.errors.is_empty());

    let article = person_service::get(&database, article.id).await;

    assert!(article.is_ok());
    validate_person_response(&article.unwrap(), None, folder_id, "Jane Doe", "Jane");
}

#[rstest]
#[tokio::test]
async fn test_error_on_updating_nonexistent_person(
    settings: &Settings,
    update_payload: ArticleUpdateSchema<PersonDataSchema>,
) {
    let database = database(settings).await;
    let response = person_service::update(&database, update_payload).await;
    assert!(response.is_ok());
    assert!(!response.unwrap().errors.is_empty());
}

#[rstest]
#[tokio::test]
async fn test_get_person(
    settings: &Settings,
    folder_id: i32,
    name: String,
    create_payload: ArticleCreateSchema<PersonDataSchema>,
) {
    let database = database(settings).await;
    let article = person_service::create(&database, create_payload)
        .await
        .unwrap();

    let article = person_service::get(&database, article.id).await;

    assert!(article.is_ok());
    validate_person_response(&article.unwrap(), None, folder_id, &name, &name);
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
