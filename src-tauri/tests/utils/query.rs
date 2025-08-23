use hellebore::database::entry_manager;
use sea_orm::*;

use ::entity::entry as entry_entity;
use ::entity::word as word_entity;

pub async fn get_entry(database: &DatabaseConnection, id: i32) -> Option<entry_entity::Model> {
    let entry = entry_manager::get(database, id).await;
    assert!(entry.is_ok());
    entry.unwrap()
}

pub async fn get_all_words_for_language(
    db: &DatabaseConnection,
    id: i32,
) -> Vec<word_entity::Model> {
    let words = word_entity::Entity::find()
        .filter(word_entity::Column::LanguageId.eq(id))
        .all(db)
        .await;
    assert!(words.is_ok());

    words.unwrap()
}
