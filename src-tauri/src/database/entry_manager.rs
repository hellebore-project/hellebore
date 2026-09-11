use ::entity::entry::{
    ActiveModel as EntryActiveModel, Column as EntryColumn, Entity as EntryEntity,
    Model as EntryModel,
};
use sea_orm::*;
use uuid::Uuid;

use crate::database::folder_manager;
use crate::model::FilterItemType;
use crate::model::{
    Query, SortItem,
    entry::{EntryInfo, EntryQueryData},
};
use crate::types::{EntityType, queryable_properties::QueryableEntryProperties};
use crate::utils::{CodedEnum, sea_orm as utils};

pub async fn insert<C>(
    con: &C,
    entity_type: EntityType,
    folder_id: Uuid,
    title: String,
    text: String,
) -> Result<EntryModel, DbErr>
where
    C: ConnectionTrait,
{
    let new_entity = EntryActiveModel {
        id: Set(Uuid::new_v4()),
        folder_id: Set(folder_manager::convert_root_folder_id_to_null(folder_id)),
        title: Set(title),
        entity_type: Set(entity_type.code()),
        text: Set(text),
    };
    match new_entity.insert(con).await {
        Ok(created_entity) => created_entity.try_into_model(),
        Err(e) => Err(e),
    }
}

pub async fn update<C>(
    con: &C,
    id: Uuid,
    folder_id: Option<Uuid>,
    title: Option<String>,
    text: Option<String>,
) -> Result<EntryModel, DbErr>
where
    C: ConnectionTrait,
{
    let Some(existing_entity) = get_info(con, id).await? else {
        return Err(DbErr::RecordNotFound("Entity not found.".to_owned()));
    };
    let updated_entity = EntryActiveModel {
        id: Unchanged(existing_entity.id),
        folder_id: folder_manager::set_optional_folder_id(folder_id),
        entity_type: NotSet,
        title: utils::set_optional_value(title),
        text: utils::set_optional_value(text),
    };
    updated_entity.update(con).await
}

pub async fn exists<C>(con: &C, id: Uuid) -> Result<bool, DbErr>
where
    C: ConnectionTrait,
{
    return Ok(get_info(con, id).await?.is_some());
}

pub async fn title_exists<C>(con: &C, title: &str) -> Result<bool, DbErr>
where
    C: ConnectionTrait,
{
    return Ok(get_by_title(con, title).await?.is_some());
}

pub async fn is_title_unique_for_id<C>(
    con: &C,
    id: Option<Uuid>,
    title: &str,
) -> Result<bool, DbErr>
where
    C: ConnectionTrait,
{
    let entity = get_by_title(con, title).await?;
    match entity {
        Some(a) => match id {
            Some(id) => Ok(a.id == id),
            None => Ok(false),
        },
        None => Ok(true),
    }
}

pub async fn get<C>(con: &C, id: Uuid) -> Result<Option<EntryModel>, DbErr>
where
    C: ConnectionTrait,
{
    EntryEntity::find_by_id(id).one(con).await
}

pub async fn get_by_title<C>(con: &C, title: &str) -> Result<Option<EntryInfo>, DbErr>
where
    C: ConnectionTrait,
{
    EntryEntity::find()
        .filter(EntryColumn::Title.eq(title))
        .into_partial_model::<EntryInfo>()
        .one(con)
        .await
}

pub async fn get_info<C>(con: &C, id: Uuid) -> Result<Option<EntryInfo>, DbErr>
where
    C: ConnectionTrait,
{
    EntryEntity::find_by_id(id)
        .into_partial_model::<EntryInfo>()
        .one(con)
        .await
}

pub async fn get_many<C>(
    con: &C,
    query: &Query<QueryableEntryProperties, EntryQueryData>,
) -> Result<Vec<EntryInfo>, DbErr>
where
    C: ConnectionTrait,
{
    let mut select = EntryEntity::find();

    if let Some(like_title) = &query.options.like_title {
        select = select.filter(EntryColumn::Title.like(format!("%{}%", like_title)))
    };

    select = _apply_filters(select, &query.filters);
    select = _apply_sortation(select, &query.sortation);
    select = utils::add_pagination_clauses(select, &query.pagination);

    select.into_partial_model::<EntryInfo>().all(con).await
}

pub async fn count<C>(
    con: &C,
    query: &Query<QueryableEntryProperties, EntryQueryData>,
) -> Result<u64, DbErr>
where
    C: ConnectionTrait,
{
    let mut select = EntryEntity::find();

    if let Some(arg) = &query.options.like_title {
        select = select.filter(EntryColumn::Title.like(format!("%{}%", arg)))
    };

    select = _apply_filters(select, &query.filters);
    select = _apply_sortation(select, &query.sortation);

    select.count(con).await
}

pub async fn delete<C>(con: &C, id: Uuid) -> Result<DeleteResult, DbErr>
where
    C: ConnectionTrait,
{
    EntryEntity::delete_by_id(id).exec(con).await
}

pub async fn delete_many<C>(con: &C, ids: Vec<Uuid>) -> Result<DeleteResult, DbErr>
where
    C: ConnectionTrait,
{
    EntryEntity::delete_many()
        .filter(EntryColumn::Id.is_in(ids))
        .exec(con)
        .await
}

fn _apply_sortation(
    select: Select<EntryEntity>,
    sortation: &Vec<SortItem<QueryableEntryProperties>>,
) -> Select<EntryEntity> {
    let mut select = select;
    for sort_item in sortation {
        let column = match sort_item.field {
            QueryableEntryProperties::Id => Some(EntryColumn::Id),
            QueryableEntryProperties::FolderId => Some(EntryColumn::FolderId),
            QueryableEntryProperties::EntityType => Some(EntryColumn::EntityType),
            QueryableEntryProperties::Title => Some(EntryColumn::Title),
            _ => None,
        };
        if let Some(c) = column {
            select = utils::add_order_clause(select, c, sort_item.order);
        }
    }
    select
}

fn _apply_filters(
    select: Select<EntryEntity>,
    filters: &Vec<FilterItemType<QueryableEntryProperties>>,
) -> Select<EntryEntity> {
    let mut select = select;
    for filter in filters {
        match filter {
            FilterItemType::Integer(filter_item) => {
                let column = match filter_item.field {
                    QueryableEntryProperties::EntityType => Some(EntryColumn::EntityType),
                    _ => None,
                };
                if let Some(c) = column {
                    select =
                        utils::add_integer_filter_clauses(select, c, filter_item.predicate.clone());
                }
            }

            FilterItemType::String(filter_item) => {
                let column = match filter_item.field {
                    QueryableEntryProperties::Title => Some(EntryColumn::Title),
                    _ => None,
                };
                if let Some(c) = column {
                    select =
                        utils::add_string_filter_clauses(select, c, filter_item.predicate.clone());
                }
            }

            FilterItemType::Uuid(filter_item) => {
                let column = match filter_item.field {
                    QueryableEntryProperties::Id => Some(EntryColumn::Id),
                    QueryableEntryProperties::FolderId => Some(EntryColumn::FolderId),
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
