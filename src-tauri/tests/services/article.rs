use ::entity::article::Model as Article;
use hellebore::{
    database::article_manager,
    schema::{
        article::{ArticleInfoSchema, ArticleUpdateSchema},
        folder::FolderCreateSchema,
    },
    services::{article_service, folder_service},
    settings::Settings,
    types::ARTICLE,
};
use rstest::*;

use crate::fixtures::{article_text, database, folder_create_payload, folder_id, settings};
use crate::utils::validate_article_response;

fn validate_model(article: &Article, id: Option<i32>, folder_id: i32, title: &str, text: &str) {
    let response = article_service::generate_response(article, 0);
    validate_article_response(&response, id, folder_id, title, text);
}

fn validate_info_response(
    article: &ArticleInfoSchema,
    id: Option<i32>,
    folder_id: i32,
    title: &str,
) {
    if id.is_some() {
        assert_eq!(id.unwrap(), article.id);
    }
    assert_eq!(folder_id, article.folder_id);
    assert_eq!(title, article.title);
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
async fn test_create_article(
    settings: &Settings,
    folder_id: i32,
    title: String,
    article_text: String,
) {
    let database = database(settings).await;

    let article = article_manager::insert(
        &database,
        folder_id,
        title.to_owned(),
        ARTICLE,
        article_text.to_owned(),
    )
    .await;

    assert!(article.is_ok());
    let article = article.unwrap();
    validate_model(&article, None, folder_id, &title, &article_text);
}

#[rstest]
#[tokio::test]
async fn test_error_on_creating_article_with_duplicate_name(
    settings: &Settings,
    folder_id: i32,
    title: String,
    article_text: String,
) {
    let database = database(settings).await;
    let _ = article_manager::insert(
        &database,
        folder_id,
        title.to_owned(),
        ARTICLE,
        article_text.to_owned(),
    )
    .await;
    let article = article_manager::insert(&database, folder_id, title, ARTICLE, article_text).await;
    assert!(article.is_err());
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
    let article = article_manager::insert(&database, folder_id, title, ARTICLE, article_text)
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
    validate_model(
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
async fn test_error_on_updating_article_with_duplicate_name(
    settings: &Settings,
    folder_id: i32,
    article_text: String,
) {
    let database = database(settings).await;
    let article_1 = article_manager::insert(
        &database,
        folder_id,
        "article1".to_owned(),
        ARTICLE,
        article_text.to_owned(),
    )
    .await
    .unwrap();
    let article_2 = article_manager::insert(
        &database,
        folder_id,
        "article2".to_owned(),
        ARTICLE,
        article_text,
    )
    .await
    .unwrap();

    let response =
        article_service::update(&database, article_1.id, None, Some(article_2.title), None).await;
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
    let article = article_manager::insert(
        &database,
        folder_id,
        title.to_owned(),
        ARTICLE,
        article_text.to_owned(),
    )
    .await
    .unwrap();

    let article = article_service::get(&database, article.id).await;

    assert!(article.is_ok());
    validate_model(&article.unwrap(), None, folder_id, &title, &article_text);
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
async fn test_get_all_articles(settings: &Settings, folder_id: i32, title: String) {
    let database = database(settings).await;
    let _ = article_manager::insert(
        &database,
        folder_id,
        title.to_owned(),
        ARTICLE,
        "".to_owned(),
    )
    .await
    .unwrap();
    let title_2 = format!("{} 2", title);
    let _ = article_manager::insert(
        &database,
        folder_id,
        title_2.to_owned(),
        ARTICLE,
        "".to_owned(),
    )
    .await
    .unwrap();

    let articles = article_service::get_all(&database).await;

    assert!(articles.is_ok());
    let mut articles = articles.unwrap();
    assert_eq!(2, articles.len());
    articles.sort_by(|a, b| a.title.cmp(&b.title));
    validate_info_response(&articles[0], None, folder_id, &title);
    validate_info_response(&articles[1], None, folder_id, &title_2);
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
    let article = article_manager::insert(
        &database,
        folder_id,
        title.to_owned(),
        ARTICLE,
        article_text.to_owned(),
    )
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
