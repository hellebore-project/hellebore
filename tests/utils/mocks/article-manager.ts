import { vi } from "vitest";

import { ArticleManager } from "@/services/domain";
import { EntityInfoResponse } from "@/interface";

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
