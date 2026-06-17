use sea_orm::sea_query::Expr;
use sea_orm::*;
use uuid::Uuid;

use ::entity::{word, word::Entity as WordEntity};

use crate::types::grammar::WordType;
use crate::utils::CodedEnum;

use super::utils;

pub async fn insert<C>(
    con: &C,
    language_id: Uuid,
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

pub async fn get<C>(con: &C, id: Uuid) -> Result<Option<word::Model>, DbErr>
where
    C: ConnectionTrait,
{
    WordEntity::find_by_id(id).one(con).await
}

pub async fn get_all_for_language<C>(
    con: &C,
    language_id: Uuid,
    word_type: Option<WordType>,
) -> Result<Vec<word::Model>, DbErr>
where
    C: ConnectionTrait,
{
    query(
        language_id,
        word_type.as_ref().map(std::slice::from_ref),
        None,
        None,
        None,
    )
    .all(con)
    .await
}

#[allow(clippy::too_many_arguments)]
pub async fn get_languages_page<C>(
    con: &C,
    language_id: Uuid,
    word_types: Option<&[WordType]>,
    spelling: Option<&str>,
    definition: Option<&str>,
    translations: Option<&str>,
    page_index: u64,
    items_per_page_count: u64,
) -> Result<(Vec<word::Model>, u64, u64), DbErr>
where
    C: ConnectionTrait,
{
    let paginator = query(language_id, word_types, spelling, definition, translations)
        .paginate(con, items_per_page_count.max(1));

    let total_item_count = paginator.num_items().await?;
    let total_page_count = paginator.num_pages().await?;
    let words = paginator.fetch_page(page_index.saturating_sub(1)).await?;

    Ok((words, total_item_count, total_page_count))
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

fn query(
    language_id: Uuid,
    word_types: Option<&[WordType]>,
    spelling: Option<&str>,
    definition: Option<&str>,
    translations: Option<&str>,
) -> Select<WordEntity> {
    let mut _query = WordEntity::find()
        .filter(word::Column::LanguageId.eq(language_id))
        .order_by_asc(word::Column::Spelling);

    if let Some(word_types) = word_types.filter(|values| !values.is_empty()) {
        _query = _query.filter(
            word::Column::WordType.is_in(word_types.iter().map(|word_type| word_type.code())),
        );
    }

    if let Some(spelling) = spelling.filter(|value| !value.is_empty()) {
        _query = _query.filter(word::Column::Spelling.like(format!("%{}%", spelling)));
    }

    if let Some(definition) = definition.filter(|value| !value.is_empty()) {
        _query = _query.filter(word::Column::Definition.like(format!("%{}%", definition)));
    }

    if let Some(translations) = translations.filter(|value| !value.is_empty()) {
        _query = _query
            .filter(Expr::col(word::Column::Translations).like(format!("%{}%", translations)));
    }

    _query
}
