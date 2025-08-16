import { vi } from "vitest";

import { EntryInfoResponse } from "@/interface";
import { EntryManager } from "@/services/domain";

export interface MockGetEntriesArguments {
    manager: EntryManager;
    entities: EntryInfoResponse[];
}

export function mockGetArticles({
    manager,
    entities,
}: MockGetEntriesArguments) {
    const spy = vi
        .spyOn(manager, "_getAll")
        .mockImplementation(async () => entities);
    return spy;
}
