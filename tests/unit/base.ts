import { cleanup } from "@testing-library/react";
import userEvent, { UserEvent } from "@testing-library/user-event";
import { test as baseTest } from "vitest";

import { EntityType } from "@/domain/constants";
import { state } from "@/client/services";
import { ClientManager } from "@/client/services/client-manager";
import {
    EntryInfoResponse,
    FolderResponse,
    ProjectResponse,
} from "@/domain/schema";
import { MockedInvoker } from "@tests/utils/mocks/backend/invoker";
import {
    mockGetEntries,
    mockGetFolders,
    mockGetSession,
} from "@tests/utils/mocks";

export interface BaseUnitFixtures {
    dbFilePath: string;
    project: ProjectResponse;
    entities: EntryInfoResponse[];
    folders: FolderResponse[];
    mockedInvoker: MockedInvoker;
    service: ClientManager;
    user: UserEvent;
    setup: null;
}

// NOTE: the first argument inside a fixture must use the object destructuring pattern;
// don't get rid of the empty objects in the arrow functions below

export const test = baseTest.extend<BaseUnitFixtures>({
    // data
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

    // mocking
    mockedInvoker: [
        // eslint-disable-next-line no-empty-pattern
        async ({}, use) => {
            const invoker = new MockedInvoker();
            invoker.inject();
            await use(invoker);
        },
        { auto: true },
    ],

    user: [
        // eslint-disable-next-line no-empty-pattern
        async ({}, use) => {
            await use(userEvent.setup());
        },
        { auto: true },
    ],

    // service
    service: [
        async (
            { mockedInvoker, dbFilePath, project, entities, folders },
            use,
        ) => {
            mockGetSession(mockedInvoker, { dbFilePath, project });
            mockGetEntries(mockedInvoker, { entities });
            mockGetFolders(mockedInvoker, { folders });

            const appManager = new ClientManager();
            await appManager.initialize();
            state.manager = appManager;

            await use(appManager);
            state.manager = null;
        },
        { auto: true },
    ],

    // setup and teardown
    setup: [
        // @ts-expect-error: the user and service fixtures need to be set up first
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        async ({ mockedInvoker, user, service }, use) => {
            await use(null);

            mockedInvoker.clear();
            cleanup();
        },
        { auto: true },
    ],
});
