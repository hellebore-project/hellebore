use hellebore::{
    database::language_manager,
    schema::{article::ArticleCreateSchema, language::LanguageDataSchema},
    services::language_service,
    settings::Settings,
};
use rstest::*;

use crate::fixtures::{create_language_payload, database, folder_id, language_name, settings};
use crate::utils::validate_article_info_response;

#[rstest]
#[tokio::test]
async fn test_create_language(
    settings: &Settings,
    folder_id: i32,
    language_name: String,
    create_language_payload: ArticleCreateSchema<LanguageDataSchema>,
) {
    let database = database(settings).await;
    let article = language_service::create(&database, create_language_payload).await;

    assert!(article.is_ok());
    validate_article_info_response(&article.unwrap(), None, folder_id, &language_name);
}

#[rstest]
#[tokio::test]
async fn test_error_on_creating_duplicate_language(
    settings: &Settings,
    create_language_payload: ArticleCreateSchema<LanguageDataSchema>,
) {
    let database = database(settings).await;
    let _ = language_service::create(&database, create_language_payload.clone()).await;
    let response = language_service::create(&database, create_language_payload).await;
    assert!(response.is_err());
}

#[rstest]
#[tokio::test]
async fn test_delete_language(
    settings: &Settings,
    create_language_payload: ArticleCreateSchema<LanguageDataSchema>,
) {
    let database = database(settings).await;
    let article = language_service::create(&database, create_language_payload)
        .await
        .unwrap();

    let response = language_service::delete(&database, article.id).await;

    assert!(response.is_ok());

    let article = language_manager::get(&database, article.id).await;
    assert!(article.is_ok());
    assert!(article.unwrap().is_none());
}

#[rstest]
#[tokio::test]
async fn test_error_on_deleting_nonexistent_language(settings: &Settings) {
    let database = database(settings).await;
    let response = language_service::delete(&database, 0).await;
    assert!(response.is_err());
}
