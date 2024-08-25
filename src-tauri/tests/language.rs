use fantasy_log_app::{schema::language::LanguageDataSchema, services::language_service};

mod utils;

#[tokio::test]
async fn create_language() {
    let state = utils::setup().await;
    let language = LanguageDataSchema {
        name: String::from("French"),
    };
    let article = language_service::create(&state.database, language).await;
    assert!(article.is_ok());
    let article = article.unwrap();
    assert_eq!("French", article.entity.unwrap().data.name);
}
