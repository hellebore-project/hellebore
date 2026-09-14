use sea_orm::*;
use uuid::Uuid;

use ::entity::word::{
    ActiveModel as WordActiveModel, Column as WordColumn, Entity as WordEntity, Model as WordModel,
};

use crate::model::FilterItemType;
use crate::model::{
    Query, SortItem,
    word::{Word, WordQueryOptions},
};
use crate::types::{grammar_types::WordType, queryable_properties::QueryableWordProperties};
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
    query: &Query<QueryableWordProperties, WordQueryOptions>,
) -> Result<Vec<Word>, DbErr>
where
    C: ConnectionTrait,
{
    let mut select = WordEntity::find();

    select = utils::add_pagination_clauses(select, &query.pagination);
    select = _apply_sortation(select, &query.sortation);
    select = _apply_filters(select, &query.filters);

    select.into_partial_model::<Word>().all(con).await
}

pub async fn count<C>(
    con: &C,
    query: &Query<QueryableWordProperties, WordQueryOptions>,
) -> Result<u64, DbErr>
where
    C: ConnectionTrait,
{
    let mut select = WordEntity::find();

    select = _apply_sortation(select, &query.sortation);
    select = _apply_filters(select, &query.filters);

    select.count(con).await
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

fn _apply_sortation(
    select: Select<WordEntity>,
    sortation: &Vec<SortItem<QueryableWordProperties>>,
) -> Select<WordEntity> {
    let mut select = select;
    for sort_item in sortation {
        let column = match sort_item.field {
            QueryableWordProperties::WordType => Some(WordColumn::WordType),
            QueryableWordProperties::Spelling => Some(WordColumn::Spelling),
            QueryableWordProperties::Definition => Some(WordColumn::Definition),
            _ => None,
        };
        if let Some(c) = column {
            select = utils::add_order_clause(select, c, sort_item.order);
        }
    }
    select
}

fn _apply_filters(
    select: Select<WordEntity>,
    filters: &Vec<FilterItemType<QueryableWordProperties>>,
) -> Select<WordEntity> {
    let mut select = select;
    for filter in filters {
        match filter {
            FilterItemType::Integer(filter_item) => {
                let column = match filter_item.field {
                    QueryableWordProperties::WordType => Some(WordColumn::WordType),
                    _ => None,
                };
                if let Some(c) = column {
                    select =
                        utils::add_integer_filter_clauses(select, c, filter_item.predicate.clone());
                }
            }

            FilterItemType::String(filter_item) => {
                let column = match filter_item.field {
                    QueryableWordProperties::Spelling => Some(WordColumn::Spelling),
                    QueryableWordProperties::Definition => Some(WordColumn::Definition),
                    _ => None,
                };
                if let Some(c) = column {
                    select =
                        utils::add_string_filter_clauses(select, c, filter_item.predicate.clone());
                }
            }

            FilterItemType::Uuid(filter_item) => {
                let column = match filter_item.field {
                    QueryableWordProperties::Id => Some(WordColumn::Id),
                    QueryableWordProperties::LanguageId => Some(WordColumn::LanguageId),
                    _ => None,
                };
                if let Some(c) = column {
                    select =
                        utils::add_uuid_filter_clauses(select, c, filter_item.predicate.clone());
                }
            }
        }
    }
    select
}
