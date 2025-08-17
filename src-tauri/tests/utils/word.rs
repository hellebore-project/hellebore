use sea_orm::*;

use ::entity::word as word_entity;

pub async fn get_all_words_for_language(
    id: i32,
    db: &DatabaseConnection,
) -> Vec<word_entity::Model> {
    let words = word_entity::Entity::find()
        .filter(word_entity::Column::LanguageId.eq(id))
        .all(db)
        .await;
    assert!(words.is_ok());

    words.unwrap()
}
