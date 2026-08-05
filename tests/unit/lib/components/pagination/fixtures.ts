import { test as baseTest } from "@tests/unit/fixtures";
import { PaginationService } from "@/lib/components/pagination";

export enum UserColumnKey {
    Name = "name",
    Status = "status",
}

export interface PaginationFixtures {
    page: number;
    count: number;
    service: PaginationService;
}

export const test = baseTest.extend<PaginationFixtures>({
    page: 2,
    count: 5,
    service: async ({ page, count }, use) => {
        const service = new PaginationService({
            id: "test-pagination",
            page,
            count,
        });
        await use(service);
    },
});
