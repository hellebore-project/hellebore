import { test as baseTest } from "vitest";

import { AppManager } from "@/services/app-manager";
import { mockServices } from "@tests/utils/mocks";
import {
    EntityInfoResponse,
    EntityType,
    FolderResponse,
    ProjectResponse,
} from "@/interface";
import { state } from "@/services";
import { cleanup } from "@testing-library/react";

export interface BaseUnitFixtures {
    dbFilePath: string;
    project: ProjectResponse;
    entities: EntityInfoResponse[];
    folders: FolderResponse[];
    service: AppManager;
    cleanup: null;
}

export const test = baseTest.extend<BaseUnitFixtures>({
    dbFilePath: ["mocked/db/file/path", { injected: true }],
    project: [{ id: 1, name: "mocked-project" }, { injected: true }],
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
        async ({ dbFilePath, project, entities, folders }, use) => {
            const appManager = mockServices({
                dbFilePath,
                project,
                entities,
                folders,
            });
            state.manager = appManager;
            await use(appManager);
            state.manager = null;
        },
        { auto: true },
    ],
    cleanup: [
        async ({}, use) => {
            await use(null);
            cleanup();
        },
        { auto: true },
    ],
});
