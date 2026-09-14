import { PredicateType, QueryRequest, QueryResponse, SortOrder } from "@/api";
import { compareStrings } from "@/utils/string";

interface QueryArguments<T, P extends string | number | symbol, O> {
    items: T[];
    args: QueryRequest<P, O> | null;
    propertyMapping: Partial<Record<P, string>>;
}

export async function query<T, P extends string | number | symbol, O>({
    items,
    args,
    propertyMapping,
}: QueryArguments<T, P, O>) {
    for (const filterItem of args?.filters ?? []) {
        const propName = propertyMapping[filterItem.field] as string;
        const predicate = filterItem.predicate;

        let predicateFunc: ((item: T) => boolean) | null = null;

        switch (predicate.type) {
            case PredicateType.Equal:
                predicateFunc = (item) => item[propName] == predicate.value;
                break;
            case PredicateType.NotEqual:
                predicateFunc = (item) => item[propName] != predicate.value;
                break;
            case PredicateType.GreaterThan:
                predicateFunc = (item) => item[propName] > predicate.value;
                break;
            case PredicateType.GreaterThanOrEqual:
                predicateFunc = (item) => item[propName] >= predicate.value;
                break;
            case PredicateType.LessThan:
                predicateFunc = (item) => item[propName] < predicate.value;
                break;
            case PredicateType.LessThanOrEqual:
                predicateFunc = (item) => item[propName] <= predicate.value;
                break;
            case PredicateType.In:
                predicateFunc = (item) =>
                    predicate.values.includes(item[propName]);
                break;
            case PredicateType.NotIn:
                predicateFunc = (item) =>
                    !predicate.values.includes(item[propName]);
                break;
            case PredicateType.Like:
                predicateFunc = (item) =>
                    `${item[propName]}`.includes(predicate.value.toString());
                break;
            case PredicateType.NotLike:
                predicateFunc = (item) =>
                    !`${item[propName]}`.includes(predicate.value.toString());
                break;
        }

        if (predicateFunc) items = items.filter(predicateFunc);
    }

    for (const sortItem of args?.sortation ?? []) {
        const propName = propertyMapping[sortItem.field] as string;
        if (sortItem.order == SortOrder.Asc)
            items = items.sort((a, b) =>
                compareStrings(a[propName], b[propName]),
            );
        else if (sortItem.order == SortOrder.Desc)
            items = items.sort((a, b) =>
                compareStrings(b[propName], a[propName]),
            );
    }

    items = items
        .slice(args?.pagination?.offset ?? undefined)
        .slice(0, args?.pagination?.limit ?? undefined);

    const response: QueryResponse<T> = {
        items,
        pageIndex: args?.pagination?.pageIndex ?? 0,
        pageCount: 1,
        total: args?.includeTotal ? items.length : null,
        offset: args?.pagination?.offset ?? null,
        limit: args?.pagination?.limit ?? null,
    };
    return response;
}
