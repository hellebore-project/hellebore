use sea_orm::{
    ColumnTrait, EntityTrait, QueryFilter, QueryOrder, QuerySelect,
    entity::{ActiveValue, Value},
    query::Select,
};
use uuid::Uuid;

use crate::{
    model::{PaginationModel, Predicate},
    types::SortOrder,
    utils::CodedEnum,
};

pub fn set_optional_value<V>(value: Option<V>) -> ActiveValue<V>
where
    V: Into<Value>,
{
    match value {
        Some(v) => ActiveValue::Set(v),
        None => ActiveValue::NotSet,
    }
}

pub fn set_value_or_default<V>(value: Option<V>) -> ActiveValue<V>
where
    V: Into<Value> + Default,
{
    match value {
        Some(v) => ActiveValue::Set(v),
        None => ActiveValue::Set(V::default()),
    }
}

pub fn set_optional_type<V>(value: Option<V>) -> ActiveValue<i8>
where
    V: CodedEnum,
{
    match value {
        Some(v) => ActiveValue::Set(v.code()),
        None => ActiveValue::NotSet,
    }
}

pub fn set_type_or_default<V>(value: Option<V>) -> ActiveValue<i8>
where
    V: CodedEnum + Default,
{
    match value {
        Some(v) => ActiveValue::Set(v.code()),
        None => ActiveValue::Set(V::default().code()),
    }
}

pub fn add_pagination_clauses<T: EntityTrait>(
    select: Select<T>,
    pagination: &PaginationModel,
) -> Select<T> {
    select.offset(pagination.offset).limit(pagination.limit)
}

pub fn add_order_clause<T: EntityTrait, C: ColumnTrait>(
    select: Select<T>,
    column: C,
    order: SortOrder,
) -> Select<T> {
    match order {
        SortOrder::Asc => select.order_by_asc(column),
        SortOrder::Desc => select.order_by_desc(column),
        _ => select,
    }
}

pub fn add_integer_filter_clauses<T: EntityTrait, C: ColumnTrait>(
    select: Select<T>,
    column: C,
    predicate: Predicate<i32>,
) -> Select<T> {
    match predicate {
        Predicate::Equal { value } => select.filter(column.eq::<i32>(value)),
        Predicate::NotEqual { value } => select.filter(column.ne::<i32>(value)),
        Predicate::GreaterThan { value } => select.filter(column.gt::<i32>(value)),
        Predicate::GreaterThanOrEqual { value } => select.filter(column.gte::<i32>(value)),
        Predicate::LessThan { value } => select.filter(column.lt::<i32>(value)),
        Predicate::LessThanOrEqual { value } => select.filter(column.lte::<i32>(value)),
        Predicate::In { values } => {
            select.filter(column.is_in(values.into_iter().collect::<Vec<i32>>()))
        }
        Predicate::NotIn { values } => {
            select.filter(column.is_not_in(values.into_iter().collect::<Vec<i32>>()))
        }
        _ => select,
    }
}

pub fn add_string_filter_clauses<T: EntityTrait, C: ColumnTrait>(
    select: Select<T>,
    column: C,
    predicate: Predicate<String>,
) -> Select<T> {
    match predicate {
        Predicate::Equal { value } => select.filter(column.eq::<String>(value)),
        Predicate::NotEqual { value } => select.filter(column.ne::<String>(value)),
        Predicate::GreaterThan { value } => select.filter(column.gt::<String>(value)),
        Predicate::GreaterThanOrEqual { value } => select.filter(column.gte::<String>(value)),
        Predicate::LessThan { value } => select.filter(column.lt::<String>(value)),
        Predicate::LessThanOrEqual { value } => select.filter(column.lte::<String>(value)),
        Predicate::In { values } => {
            select.filter(column.is_in(values.into_iter().collect::<Vec<String>>()))
        }
        Predicate::NotIn { values } => {
            select.filter(column.is_not_in(values.into_iter().collect::<Vec<String>>()))
        }
        Predicate::Like { value } => select.filter(column.like::<String>(format!("%{}%", value))),
        Predicate::NotLike { value } => {
            select.filter(column.not_like::<String>(format!("%{}%", value)))
        }
    }
}

pub fn add_uuid_filter_clauses<T: EntityTrait, C: ColumnTrait>(
    select: Select<T>,
    column: C,
    predicate: Predicate<Uuid>,
) -> Select<T> {
    match predicate {
        Predicate::Equal { value } => select.filter(column.eq::<Uuid>(value)),
        Predicate::NotEqual { value } => select.filter(column.ne::<Uuid>(value)),
        Predicate::GreaterThan { value } => select.filter(column.gt::<Uuid>(value)),
        Predicate::GreaterThanOrEqual { value } => select.filter(column.gte::<Uuid>(value)),
        Predicate::LessThan { value } => select.filter(column.lt::<Uuid>(value)),
        Predicate::LessThanOrEqual { value } => select.filter(column.lte::<Uuid>(value)),
        Predicate::In { values } => {
            select.filter(column.is_in(values.into_iter().collect::<Vec<Uuid>>()))
        }
        Predicate::NotIn { values } => {
            select.filter(column.is_not_in(values.into_iter().collect::<Vec<Uuid>>()))
        }
        _ => select,
    }
}
