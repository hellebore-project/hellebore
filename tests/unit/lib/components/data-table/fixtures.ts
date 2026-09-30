import { test as baseTest } from "@tests/unit/fixtures";
import { DataType, PredicateType } from "@/api";
import { DataRow, DataTableService } from "@/lib/components/data-table";

export enum UserColumnKey {
    Name = "name",
    Status = "status",
}

export interface DataTableFixtures {
    data: DataRow<UserColumnKey>[];
    service: DataTableService<UserColumnKey>;
}

export const test = baseTest.extend<DataTableFixtures>({
    data: [
        {
            key: "1",
            cells: {
                name: { value: "Alice" },
                status: { value: "active" },
            },
        },
        {
            key: "2",
            cells: {
                name: { value: "John" },
                status: { value: "inactive" },
            },
        },
    ],
    service: async ({ data }, use) => {
        const service = new DataTableService<UserColumnKey>({
            id: "test-table",
            columns: [
                {
                    key: UserColumnKey.Name,
                    label: "Name",
                    dataType: DataType.String,
                    fieldType: "text",
                    filterable: true,
                    metaData: {},
                },
                {
                    key: UserColumnKey.Status,
                    label: "Status",
                    dataType: DataType.String,
                    fieldType: "select",
                    filterable: true,
                    items: [
                        { label: "Active", value: "active" },
                        { label: "Inactive", value: "inactive" },
                    ],
                    metaData: {},
                },
            ],
        });

        service.onQueryData.subscribe(({ filters }) => {
            let filtered = [...data];

            for (const [key, filter] of Object.entries(filters)) {
                if (!filter) continue;

                const predicate = filter.predicate;

                if (predicate.type === PredicateType.Like) {
                    filtered = filtered.filter((row) =>
                        row.cells[key as UserColumnKey].value
                            .toLowerCase()
                            .includes(String(predicate.value).toLowerCase()),
                    );
                }

                if (predicate.type === PredicateType.In) {
                    filtered = filtered.filter((row) =>
                        predicate.values.includes(
                            row.cells[key as UserColumnKey].value,
                        ),
                    );
                }
            }

            return {
                items: filtered,
                pagination: {
                    pageIndex: 0,
                    pageCount: 1,
                    total: filtered.length,
                },
            };
        });

        service.load(data);
        await use(service);
    },
});
