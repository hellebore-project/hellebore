use hellebore::schema::article::{ArticleInfoSchema, ArticleResponseSchema};

pub fn validate_article_info_response(
    response: &ArticleInfoSchema,
    id: Option<i32>,
    folder_id: i32,
    title: &str,
) {
    if id.is_some() {
        assert_eq!(id.unwrap(), response.id);
    }
    assert_eq!(folder_id, response.folder_id);
    assert_eq!(title, response.title);
}

pub fn validate_article_response(
    response: &ArticleResponseSchema,
    id: Option<i32>,
    folder_id: i32,
    title: &str,
    text: &str,
) {
    if id.is_some() {
        assert_eq!(id.unwrap(), response.id);
    }
    assert_eq!(folder_id, response.folder_id);
    assert_eq!(title, response.title);
    assert_eq!(text, response.body);
}
