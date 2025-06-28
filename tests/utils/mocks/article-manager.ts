import { vi } from "vitest";

import { EntityInfoResponse } from "@/interface";
import { ArticleManager } from "@/services/domain";

export interface MockGetArticlesArguments {
    manager: ArticleManager;
    entities: EntityInfoResponse[];
}

export function mockGetArticles({
    manager,
    entities,
}: MockGetArticlesArguments) {
    const spy = vi
        .spyOn(manager, "_getAll")
        .mockImplementation(async () => entities);
    return spy;
}
