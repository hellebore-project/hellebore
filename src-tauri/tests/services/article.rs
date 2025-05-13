use ::entity::article::Model as Article;
use hellebore::{
    database::article_manager,
    schema::{
        article::{ArticleInfoSchema, ArticleResponseSchema},
        folder::FolderCreateSchema,
    },
    services::{article_service, folder_service},
    settings::Settings,
    types::{EntityType, ARTICLE},
};
use rstest::*;

use crate::fixtures::{article_text, database, folder_create_payload, folder_id, settings};
use crate::utils::validate_article_response;

fn validate_model(article: &Article, id: Option<i32>, folder_id: i32, title: &str, text: &str) {
    let response = ArticleResponseSchema {
        id: article.id,
        folder_id: article.folder_id,
        entity_type: EntityType::from(article.entity_type),
        title: article.title.to_string(),
        body: article.body.to_string(),
    };
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
async fn test_update_article_title(
    settings: &Settings,
    folder_id: i32,
    title: String,
    article_text: String,
) {
    let database = database(settings).await;
    let article = article_manager::insert(
        &database,
        folder_id,
        title,
        ARTICLE,
        article_text.to_owned(),
    )
    .await
    .unwrap();

    let response =
        article_service::update_title(&database, article.id, "new title".to_owned()).await;

    assert!(response.is_ok());

    let article = article_service::get(&database, article.id).await;

    assert!(article.is_ok());
    validate_model(
        &article.unwrap(),
        None,
        folder_id,
        "new title",
        &article_text,
    );
}

#[rstest]
#[tokio::test]
async fn test_update_article_folder(
    settings: &Settings,
    folder_id: i32,
    folder_create_payload: FolderCreateSchema,
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
    let folder = folder_service::create(&database, folder_create_payload)
        .await
        .unwrap();

    let response = article_service::update_folder(&database, article.id, folder.id).await;

    assert!(response.is_ok());

    let article = article_service::get(&database, article.id).await;

    assert!(article.is_ok());
    validate_model(&article.unwrap(), None, folder.id, &title, &article_text);
}

#[rstest]
#[tokio::test]
async fn test_update_article_text(
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
        article_text,
    )
    .await
    .unwrap();

    let response =
        article_service::update_text(&database, article.id, "updated text".to_owned()).await;

    assert!(response.is_ok());

    let article = article_service::get(&database, article.id).await;

    assert!(article.is_ok());
    validate_model(&article.unwrap(), None, folder_id, &title, "updated text");
}

#[rstest]
#[tokio::test]
async fn test_error_on_updating_title_of_nonexistent_article(settings: &Settings) {
    let database = database(settings).await;
    let response = article_service::update_title(&database, 0, "".to_owned()).await;
    assert!(response.is_err());
}

#[rstest]
#[tokio::test]
async fn test_error_on_updating_folder_of_nonexistent_article(settings: &Settings) {
    let database = database(settings).await;
    let response = article_service::update_folder(&database, 0, -1).await;
    assert!(response.is_err());
}

#[rstest]
#[tokio::test]
async fn test_error_on_updating_text_of_nonexistent_article(settings: &Settings) {
    let database = database(settings).await;
    let response = article_service::update_text(&database, 0, "".to_owned()).await;
    assert!(response.is_err());
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

    let response = article_service::update_title(&database, article_1.id, article_2.title).await;
    assert!(response.is_err());
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
