import { EntryViewType } from "@/constants";
import {
    EntryType,
    type EntryPropertyResponse,
    type PersonProperties,
} from "@/api";
import type { PropertyEditorService } from "@/ui/centre/entry-editor/property-editor";
import { mockGetEntryProperties } from "@tests/utils/mocks";

import { test as baseTest } from "../fixtures";

export interface BasePropertyEditorFixtures {
    entryType: EntryType.Person;
    entryProperties: PersonProperties;
    mockedEntryProperties: EntryPropertyResponse;
    propertyEditorService: PropertyEditorService;
}

export const test = baseTest
    .extend<BasePropertyEditorFixtures>({
        entryType: EntryType.Person,
        entryProperties: async ({}, use) => use({ name: "" }),

        mockedEntryProperties: async (
            { mockedInvoker, mockedEntryInfo, entryProperties },
            use,
        ) => {
            const entryWithProperties: EntryPropertyResponse = {
                info: mockedEntryInfo,
                properties: entryProperties,
            };
            mockGetEntryProperties(mockedInvoker, entryWithProperties);
            await use(entryWithProperties);
        },

        propertyEditorService: async ({ entryEditorService }, use) => {
            await use(entryEditorService.properties);
        },
    })
    .override({
        entryViewType: EntryViewType.PropertyEditor,
        entryEditorMocks: async ({ mockedEntryProperties }, use) => {
            await use(null);
        },
    });
