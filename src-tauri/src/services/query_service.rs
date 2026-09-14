use sea_orm::ConnectionTrait;

use crate::{
    model::{
        Error, FilterItem, FilterItemType, PaginationModel, Predicate, Querier, Query, QueryResult,
        SortItem,
    },
    schema::query::{FilterItemUnionSchema, PredicateUnionSchema, QueryRequestSchema},
    utils::CodedEnum,
};

pub fn create_pagination_model<P: CodedEnum, T: Default>(
    query_request: &QueryRequestSchema<P, T>,
) -> PaginationModel {
    PaginationModel {
        offset: query_request.pagination.offset,
        limit: query_request.pagination.limit,
    }
}

pub fn create_sortation_model<P: CodedEnum, T: Default>(
    query: &QueryRequestSchema<P, T>,
) -> Vec<SortItem<P>> {
    query
        .sortation
        .iter()
        .map(|sort_item| SortItem {
            field: sort_item.field,
            order: sort_item.order,
        })
        .collect()
}

pub fn create_filter_model<P: CodedEnum, T: Default>(
    query: &QueryRequestSchema<P, T>,
) -> Vec<FilterItemType<P>> {
    query
        .filters
        .iter()
        .map(|filter_schema| match filter_schema {
            FilterItemUnionSchema::Integer(item) => {
                let predicate = create_predicate(&item.predicate);
                let item = FilterItem {
                    field: item.field,
                    predicate,
                };
                FilterItemType::Integer(item)
            }

            FilterItemUnionSchema::String(item) => {
                let predicate = create_predicate(&item.predicate);
                let item = FilterItem {
                    field: item.field,
                    predicate,
                };
                FilterItemType::String(item)
            }

            FilterItemUnionSchema::Uuid(item) => {
                let predicate = create_predicate(&item.predicate);
                let item = FilterItem {
                    field: item.field,
                    predicate,
                };
                FilterItemType::Uuid(item)
            }
        })
        .collect()
}

pub fn create_predicate<T: Clone>(predicate_schema: &PredicateUnionSchema<T>) -> Predicate<T> {
    match predicate_schema {
        PredicateUnionSchema::Equal { value } => Predicate::Equal {
            value: value.clone(),
        },
        PredicateUnionSchema::NotEqual { value } => Predicate::NotEqual {
            value: value.clone(),
        },
        PredicateUnionSchema::GreaterThan { value } => Predicate::GreaterThan {
            value: value.clone(),
        },
        PredicateUnionSchema::GreaterThanOrEqual { value } => Predicate::GreaterThanOrEqual {
            value: value.clone(),
        },
        PredicateUnionSchema::LessThan { value } => Predicate::LessThan {
            value: value.clone(),
        },
        PredicateUnionSchema::LessThanOrEqual { value } => Predicate::LessThanOrEqual {
            value: value.clone(),
        },
        PredicateUnionSchema::In { values } => Predicate::In {
            values: values.clone(),
        },
        PredicateUnionSchema::NotIn { values } => Predicate::NotIn {
            values: values.clone(),
        },
        PredicateUnionSchema::Like { value } => Predicate::Like {
            value: value.clone(),
        },
        PredicateUnionSchema::NotLike { value } => Predicate::NotLike {
            value: value.clone(),
        },
    }
}

pub async fn paginated_query<Q: Querier, C: ConnectionTrait>(
    con: &C,
    args: Query<Q::P, Q::O>,
    include_total: bool,
) -> Result<QueryResult<Q::R>, Error> {
    let items = Q::query(con, &args).await?;

    let total = match include_total {
        true => Q::count(con, &args).await.map(Some),
        false => Ok(None),
    }?;

    let page_count = compute_page_count(total, args.pagination.limit);

    let page_index = compute_page_index(args.pagination.offset, args.pagination.limit);

    let page = QueryResult {
        items,
        page_index,
        page_count,
        total,
        offset: args.pagination.offset,
        limit: args.pagination.limit,
    };
    Ok(page)
}

pub fn compute_page_count(total: Option<u64>, limit: Option<u64>) -> Option<u64> {
    match total {
        Some(total) => match limit {
            Some(limit) => {
                let remainder = total % limit;
                let mut page_count = (total - remainder) / limit;
                if remainder > 0 {
                    page_count += 1;
                }
                Some(page_count)
            }
            None => Some(1),
        },
        None => None,
    }
}

pub fn compute_page_index(offset: Option<u64>, limit: Option<u64>) -> u64 {
    if offset.is_none() {
        return 0;
    }
    if limit.is_none() {
        return 0;
    }

    let offset = offset.unwrap();
    let limit = limit.unwrap();

    let remainder = offset % limit;
    let mut previous_page_count = (offset - remainder) / limit;
    if remainder > 0 {
        previous_page_count += 1;
    }

    previous_page_count // this is equivalent to the 0-based index of the current page
}
