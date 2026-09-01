use sea_orm::*;
use uuid::Uuid;

use ::entity::word::{
    ActiveModel as WordActiveModel, Column as WordColumn, Entity as WordEntity, Model as WordModel,
};

use crate::model::word::Word;
use crate::types::grammar_types::WordType;
use crate::utils::{CodedEnum, sea_orm as utils};

pub async fn insert<C>(
    con: &C,
    language_id: Uuid,
    word_type: WordType,
    spelling: Option<String>,
    definition: Option<String>,
    translations: Option<serde_json::Value>,
) -> Result<WordModel, DbErr>
where
    C: ConnectionTrait,
{
    let translations = match translations {
        Some(t) => Set(t),
        None => NotSet,
    };
    let new_entity = WordActiveModel {
        id: Set(Uuid::new_v4()),
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
    id: Uuid,
    language_id: Option<Uuid>,
    word_type: Option<WordType>,
    spelling: Option<String>,
    definition: Option<String>,
    translations: Option<serde_json::Value>,
) -> Result<WordModel, DbErr>
where
    C: ConnectionTrait,
{
    let translations = match translations {
        Some(t) => Set(t),
        None => NotSet,
    };
    let updated_entity = WordActiveModel {
        id: Unchanged(id),
        language_id: utils::set_optional_value(language_id),
        word_type: utils::set_optional_type(word_type),
        spelling: utils::set_optional_value(spelling),
        definition: utils::set_optional_value(definition),
        translations,
    };
    updated_entity.update(con).await
}

pub async fn get<C>(con: &C, id: Uuid) -> Result<Option<WordModel>, DbErr>
where
    C: ConnectionTrait,
{
    WordEntity::find_by_id(id).one(con).await
}

pub async fn get_all_for_language<C>(
    con: &C,
    language_id: Uuid,
    word_type: Option<WordType>,
) -> Result<Vec<WordModel>, DbErr>
where
    C: ConnectionTrait,
{
    let mut query = WordEntity::find()
        .filter(WordColumn::LanguageId.eq(language_id))
        .order_by_asc(WordColumn::Spelling);
    if let Some(word_type) = word_type {
        query = query.filter(WordColumn::WordType.eq(word_type.code()));
    }
    query.all(con).await
}

pub async fn get_many<C>(
    con: &C,
    language_id: Option<Uuid>,
    word_types: Option<Vec<WordType>>,
    like_spelling: &Option<String>,
    offset: Option<u64>,
    limit: Option<u64>,
) -> Result<Vec<Word>, DbErr>
where
    C: ConnectionTrait,
{
    let mut query = WordEntity::find();

    if let Some(language_id) = language_id {
        query = query.filter(WordColumn::LanguageId.eq(language_id));
    }

    if let Some(word_types) = word_types.filter(|types| !types.is_empty()) {
        let codes: Vec<i8> = word_types
            .iter()
            .map(|word_type| word_type.code())
            .collect();
        query = query.filter(WordColumn::WordType.is_in(codes));
    }

    if let Some(arg) = like_spelling {
        query = query.filter(WordColumn::Spelling.like(format!("%{}%", arg)));
    }

    query
        .order_by_asc(WordColumn::Spelling)
        .offset(offset)
        .limit(limit)
        .into_partial_model::<Word>()
        .all(con)
        .await
}

pub async fn count<C>(
    con: &C,
    language_id: Option<Uuid>,
    word_types: Option<Vec<WordType>>,
    like_spelling: &Option<String>,
) -> Result<u64, DbErr>
where
    C: ConnectionTrait,
{
    let mut query = WordEntity::find();

    if let Some(language_id) = language_id {
        query = query.filter(WordColumn::LanguageId.eq(language_id));
    }

    if let Some(word_types) = word_types.filter(|types| !types.is_empty()) {
        let codes: Vec<i8> = word_types
            .iter()
            .map(|word_type| word_type.code())
            .collect();
        query = query.filter(WordColumn::WordType.is_in(codes));
    }

    if let Some(arg) = like_spelling {
        query = query.filter(WordColumn::Spelling.like(format!("%{}%", arg)));
    }

    query.order_by_asc(WordColumn::Spelling).count(con).await
}

pub async fn delete<C>(con: &C, id: Uuid) -> Result<DeleteResult, DbErr>
where
    C: ConnectionTrait,
{
    let Some(existing_entity) = get(con, id).await? else {
        return Err(DbErr::RecordNotFound("Word not found.".to_owned()));
    };
    return existing_entity.delete(con).await;
}
