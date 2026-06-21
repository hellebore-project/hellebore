import { test as baseTest } from "@tests/unit/fixtures";
import { DataRow, DataTableService } from "@/lib/components/data-table";

export enum UserColumnKey {
    Name = "name",
    Status = "status",
}

export interface DataTableTestFixtures {
    data: DataRow<UserColumnKey>[];
    service: DataTableService<UserColumnKey>;
}

export const test = baseTest.extend<DataTableTestFixtures>({
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
                    type: "text",
                    filterable: true,
                },
                {
                    key: UserColumnKey.Status,
                    label: "Status",
                    type: "select",
                    filterable: true,
                    items: [
                        { label: "Active", value: "active" },
                        { label: "Inactive", value: "inactive" },
                    ],
                },
            ],
        });
        service.load(data);
        await use(service);
    },
});
