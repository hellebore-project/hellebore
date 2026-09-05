use crate::model::{Error, Querier, QueryArgs, QueryResultPage};
use sea_orm::ConnectionTrait;

pub async fn paginated_query<Q: Querier, C: ConnectionTrait>(
    con: &C,
    args: QueryArgs<Q::O>,
    include_total: bool,
) -> Result<QueryResultPage<Q::R>, Error> {
    let items = Q::query(con, &args).await?;

    let total = match include_total {
        true => Q::count(con, &args).await.map(Some),
        false => Ok(None),
    }?;

    // converting from usize (4-byte or 8-byte depending on the system) to u64 (8-byte)
    let item_count = items.len().try_into().unwrap();

    let page_count = compute_page_count(total, args.limit);

    let page_index = compute_page_index(args.offset, args.limit);

    let page = QueryResultPage {
        items,
        item_count,
        page_index,
        page_count,
        total,
        offset: args.offset,
        limit: args.limit,
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
