import { cleanup } from "@testing-library/react";
import userEvent, { UserEvent } from "@testing-library/user-event";
import { test as baseTest } from "vitest";

import { EntityType } from "@/constants";
import { state } from "@/services";
import { AppManager } from "@/services/app-manager";
import { EntryInfoResponse, FolderResponse, ProjectResponse } from "@/schema";
import { mockServices } from "@tests/utils/mocks";

export interface BaseUnitFixtures {
    dbFilePath: string;
    project: ProjectResponse;
    entities: EntryInfoResponse[];
    folders: FolderResponse[];
    service: AppManager;
    user: UserEvent;
    setup: null;
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
    user: [
        async ({}, use) => {
            await use(userEvent.setup());
        },
        { auto: true },
    ],
    setup: [
        async ({ user }, use) => {
            user; // instantiate the user during setup
            await use(null);
            cleanup();
        },
        { auto: true },
    ],
});
