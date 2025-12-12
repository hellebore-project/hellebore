import { EntryViewType, PropertyEditorService } from "@/client";
import { EntryPropertyResponse } from "@/domain";
import { mockGetEntryProperties } from "@tests/utils/mocks";

import { test as baseTest } from "../fixtures";

export interface BasePropertyEditorFixtures {
    entryProperties: Record<string, any>;
    mockedEntryProperties: EntryPropertyResponse;
    propertyEditorService: PropertyEditorService;
}

export const test = baseTest.extend<BasePropertyEditorFixtures>({
    // data
    entryProperties: async ({}, use) => use({}),
    mockedEntryProperties: async (
        { mockedInvoker, mockedEntryInfo, entryProperties },
        use,
    ) => {
        const entryWithProperties: EntryPropertyResponse = {
            info: mockedEntryInfo,
            properties: entryProperties,
        };
        mockGetEntryProperties(mockedInvoker, entryWithProperties);
        use(entryWithProperties);
    },

    // services
    propertyEditorService: [
        async ({ clientManager, entryId, mockedEntryProperties }, use) => {
            const { service, loading } = clientManager.central.openEntryEditor({
                id: entryId,
                viewKey: EntryViewType.PropertyEditor,
            });
            await loading;

            await use(service.properties);
        },
        { auto: true },
    ],
});
