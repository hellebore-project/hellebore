use crate::model::{Error, Querier, Query, QueryResult};
use sea_orm::ConnectionTrait;

pub async fn paginated_query<Q: Querier, C: ConnectionTrait>(
    con: &C,
    args: Query<Q::O>,
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
