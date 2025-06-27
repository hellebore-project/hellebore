import { test as baseTest } from "vitest";

import { AppManager } from "@/services/app-manager";
import { mockServices } from "@tests/utils/mocks";
import { EntityInfoResponse, EntityType, FolderResponse } from "@/interface";

export interface BaseUnitFixtures {
    projectName: string;
    dbFilePath: string;
    entities: EntityInfoResponse[];
    folders: FolderResponse[];
    service: AppManager;
}

export const test = baseTest.extend<BaseUnitFixtures>({
    projectName: ["mock-project", { injected: true }],
    dbFilePath: ["mocked/db/file/path", { injected: true }],
    entities: [
        [
            {
                id: 1,
                folder_id: -1,
                entity_type: EntityType.PERSON,
                title: "mocked-entity",
            },
        ],
        { injected: true },
    ],
    folders: [[], { injected: true }],
    service: [
        ({ projectName, dbFilePath, entities, folders }, use) => {
            const appManager = mockServices({
                projectName,
                dbFilePath,
                entities,
                folders,
            });
            return use(appManager);
        },
        { auto: true },
    ],
});
