use hellebore::{
    schema::{article::ArticleCreateSchema, language::LanguageDataSchema},
    services::language_service,
};

mod utils;

#[tokio::test]
async fn create_language() {
    let state = utils::setup().await;
    let state = state.get_data().await;

    let language = LanguageDataSchema {
        name: String::from("French"),
    };
    let payload = ArticleCreateSchema {
        folder_id: -1,
        title: language.name.to_string(),
        data: language,
    };
    let article = language_service::create(&state.database, payload).await;
    assert!(article.is_ok());
    let article = article.unwrap();
    assert_eq!("French", article.entity.unwrap().name);
}
