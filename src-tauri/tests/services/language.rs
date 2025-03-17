use hellebore::{
    schema::{
        article::{ArticleCreateSchema, ArticleResponseSchema, ArticleUpdateSchema},
        language::LanguageDataSchema,
    },
    services::language_service,
    settings::Settings,
    types::LANGUAGE,
};
use rstest::*;

use crate::fixtures::{database, folder_id, settings};
use crate::utils::validate_article_response;

fn validate_language_response(
    article: &ArticleResponseSchema<LanguageDataSchema>,
    id: Option<i32>,
    folder_id: i32,
    title: &str,
    text: &str,
) {
    assert_eq!(title, &article.entity.as_ref().unwrap().name);
    validate_article_response(article, id, folder_id, title, text);
}

#[fixture]
fn name() -> String {
    return "French".to_string();
}

#[fixture]
fn create_payload(folder_id: i32, name: String) -> ArticleCreateSchema<LanguageDataSchema> {
    let language = LanguageDataSchema { name };
    ArticleCreateSchema {
        folder_id,
        title: language.name.to_string(),
        data: language,
    }
}

#[fixture]
fn update_payload() -> ArticleUpdateSchema<LanguageDataSchema> {
    ArticleUpdateSchema {
        id: 0,
        folder_id: None,
        entity_type: LANGUAGE,
        title: None,
        entity: None,
        body: None,
    }
}

#[rstest]
#[tokio::test]
async fn create_language(
    settings: &Settings,
    folder_id: i32,
    name: String,
    create_payload: ArticleCreateSchema<LanguageDataSchema>,
) {
    let database = database(settings).await;
    let article = language_service::create(&database, create_payload).await;

    assert!(article.is_ok());
    validate_language_response(&article.unwrap(), None, folder_id, &name, "");
}

#[rstest]
#[tokio::test]
async fn update_language(
    settings: &Settings,
    folder_id: i32,
    create_payload: ArticleCreateSchema<LanguageDataSchema>,
    mut update_payload: ArticleUpdateSchema<LanguageDataSchema>,
) {
    let database = database(settings).await;
    let article = language_service::create(&database, create_payload)
        .await
        .unwrap();

    update_payload.id = article.id;
    update_payload.title = Some("Spanish".to_owned());
    let response = language_service::update(&database, update_payload).await;

    assert!(response.is_ok());
    let response = response.unwrap();
    assert!(response.errors.is_empty());

    let article = language_service::get(&database, article.id).await;

    assert!(article.is_ok());
    validate_language_response(&article.unwrap(), None, folder_id, "Spanish", "");
}

#[rstest]
#[tokio::test]
async fn get_language(
    settings: &Settings,
    folder_id: i32,
    name: String,
    create_payload: ArticleCreateSchema<LanguageDataSchema>,
) {
    let database = database(settings).await;
    let article = language_service::create(&database, create_payload)
        .await
        .unwrap();

    let article = language_service::get(&database, article.id).await;

    assert!(article.is_ok());
    validate_language_response(&article.unwrap(), None, folder_id, &name, "");
}

#[rstest]
#[tokio::test]
async fn delete_language(
    settings: &Settings,
    create_payload: ArticleCreateSchema<LanguageDataSchema>,
) {
    let database = database(settings).await;
    let article = language_service::create(&database, create_payload)
        .await
        .unwrap();

    let result = language_service::delete(&database, article.id).await;

    assert!(result.is_ok());

    let article = language_service::get(&database, article.id).await;
    assert!(article.is_err());
}
