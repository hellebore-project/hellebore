use futures::future;
use sea_orm::*;

use hellebore::database::entry_manager;
use hellebore::schema::word::WordUpsertSchema;
use hellebore::services::word_service;
use hellebore::types::entity::ENTRY;

use ::entity::entry as entry_entity;
use ::entity::word as word_entity;

pub async fn create_generic_entry(
    database: &DatabaseConnection,
    folder_id: i32,
    title: String,
    text: String,
) -> entry_entity::Model {
    entry_manager::insert(database, ENTRY, folder_id, title, text)
        .await
        .unwrap()
}

pub async fn create_generic_entries(
    database: &DatabaseConnection,
    titles: Vec<String>,
) -> Vec<entry_entity::Model> {
    future::join_all(
        titles
            .into_iter()
            .map(async |title| create_generic_entry(database, -1, title, "".to_owned()).await),
    )
    .await
}

pub async fn get_entry(database: &DatabaseConnection, id: i32) -> Option<entry_entity::Model> {
    let entry = entry_manager::get(database, id).await;
    assert!(entry.is_ok());
    entry.unwrap()
}

pub async fn upsert_word(db: &DatabaseConnection, word_payload: &WordUpsertSchema) -> Option<i32> {
    let responses = word_service::bulk_upsert(&db, vec![word_payload.clone()])
        .await
        .unwrap();
    let response = responses.get(0).unwrap();
    response.data.id
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
