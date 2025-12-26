use sea_orm::*;

use ::entity::{word, word::Entity as WordEntity};

use crate::types::grammar::WordType;
use crate::utils::CodedEnum;

use super::utils;

pub async fn insert<C>(
    con: &C,
    language_id: i32,
    word_type: WordType,
    spelling: Option<String>,
    definition: Option<String>,
    translations: Option<serde_json::Value>,
) -> Result<word::Model, DbErr>
where
    C: ConnectionTrait,
{
    let translations = match translations {
        Some(t) => Set(t),
        None => NotSet,
    };
    let new_entity = word::ActiveModel {
        id: NotSet,
        language_id: Set(language_id),
        word_type: Set(word_type.code()),
        spelling: utils::set_value_or_default(spelling),
        definition: utils::set_value_or_default(definition),
        translations,
    };
    return new_entity.insert(con).await;
}

pub async fn update<C>(
    con: &C,
    id: i32,
    language_id: Option<i32>,
    word_type: Option<WordType>,
    spelling: Option<String>,
    definition: Option<String>,
    translations: Option<serde_json::Value>,
) -> Result<word::Model, DbErr>
where
    C: ConnectionTrait,
{
    let translations = match translations {
        Some(t) => Set(t),
        None => NotSet,
    };
    let updated_entity = word::ActiveModel {
        id: Unchanged(id),
        language_id: utils::set_optional_value(language_id),
        word_type: utils::set_optional_type(word_type),
        spelling: utils::set_optional_value(spelling),
        definition: utils::set_optional_value(definition),
        translations,
    };
    updated_entity.update(con).await
}

pub async fn get<C>(con: &C, id: i32) -> Result<Option<word::Model>, DbErr>
where
    C: ConnectionTrait,
{
    WordEntity::find_by_id(id).one(con).await
}

pub async fn get_all_for_language<C>(
    con: &C,
    language_id: i32,
    word_type: Option<WordType>,
) -> Result<Vec<word::Model>, DbErr>
where
    C: ConnectionTrait,
{
    let mut query = WordEntity::find()
        .filter(word::Column::LanguageId.eq(language_id))
        .order_by_asc(word::Column::Spelling);
    if word_type.is_some() {
        query = query.filter(word::Column::WordType.eq(word_type.unwrap().code()));
    }
    query.all(con).await
}

pub async fn delete<C>(con: &C, id: i32) -> Result<DeleteResult, DbErr>
where
    C: ConnectionTrait,
{
    let Some(existing_entity) = get(con, id).await? else {
        return Err(DbErr::RecordNotFound("Word not found.".to_owned()));
    };
    return existing_entity.delete(con).await;
}
