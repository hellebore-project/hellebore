use ::entity::article::Model as Article;
use hellebore::{
    database::article_manager,
    schema::{article::ArticleUpdateSchema, folder::FolderCreateSchema},
    services::{article_service, folder_service},
    settings::Settings,
    types::ARTICLE,
};
use rstest::*;

use crate::fixtures::{article_text, database, folder_create_payload, folder_id, settings};
use crate::utils::validate_article_response as _validate_article_response;

fn validate_article_response(
    article: &Article,
    id: Option<i32>,
    folder_id: i32,
    title: &str,
    text: &str,
) {
    let response = article_service::generate_article_response(article, ARTICLE, 0);
    _validate_article_response(&response, id, folder_id, title, text);
}

#[fixture]
fn title() -> String {
    "Article".to_string()
}

#[fixture]
fn update_payload() -> ArticleUpdateSchema<()> {
    ArticleUpdateSchema {
        id: 0,
        folder_id: None,
        entity_type: ARTICLE,
        title: None,
        entity: None,
        body: None,
    }
}

#[rstest]
#[tokio::test]
async fn test_update_article(
    settings: &Settings,
    folder_id: i32,
    folder_create_payload: FolderCreateSchema,
    title: String,
    article_text: String,
) {
    let database = database(settings).await;
    let article = article_manager::insert(&database, folder_id, &title, ARTICLE, &article_text)
        .await
        .unwrap();
    let folder = folder_service::create(&database, folder_create_payload)
        .await
        .unwrap();

    let response = article_service::update(
        &database,
        article.id,
        Some(folder.id),
        Some("new title".to_owned()),
        Some("updated text".to_owned()),
    )
    .await;

    assert!(response.is_ok());
    let response = response.unwrap();
    assert!(response.errors.is_empty());

    let article = article_service::get(&database, article.id).await;

    assert!(article.is_ok());
    validate_article_response(
        &article.unwrap(),
        None,
        folder.id,
        "new title",
        "updated text",
    );
}

#[rstest]
#[tokio::test]
async fn test_error_on_updating_nonexistent_article(settings: &Settings) {
    let database = database(settings).await;
    let response = article_service::update(&database, 0, None, None, None).await;
    assert!(response.is_ok());
    assert!(!response.unwrap().errors.is_empty());
}

#[rstest]
#[tokio::test]
async fn test_get_article(
    settings: &Settings,
    folder_id: i32,
    title: String,
    article_text: String,
) {
    let database = database(settings).await;
    let article = article_manager::insert(&database, folder_id, &title, ARTICLE, &article_text)
        .await
        .unwrap();

    let article = article_service::get(&database, article.id).await;

    assert!(article.is_ok());
    validate_article_response(&article.unwrap(), None, folder_id, &title, &article_text);
}

#[rstest]
#[tokio::test]
async fn test_error_on_getting_nonexistent_article(settings: &Settings) {
    let database = database(settings).await;
    let response = article_service::get(&database, 0).await;
    assert!(response.is_err());
}

#[rstest]
#[tokio::test]
async fn test_delete_article(
    settings: &Settings,
    folder_id: i32,
    title: String,
    article_text: String,
) {
    let database = database(settings).await;
    let article = article_manager::insert(&database, folder_id, &title, ARTICLE, &article_text)
        .await
        .unwrap();

    let response = article_service::delete(&database, article.id).await;

    assert!(response.is_ok());

    let article = article_service::get(&database, article.id).await;
    assert!(article.is_err());
}

#[rstest]
#[tokio::test]
async fn test_error_on_deleting_nonexistent_article(settings: &Settings) {
    let database = database(settings).await;
    let response = article_service::delete(&database, 0).await;
    assert!(response.is_err());
}
