import { EntryViewType } from "@/constants";
import { EntryType } from "@/api";
import type { PropertyEditorService } from "@/ui/centre/entry-editor/property-editor";

import { test as baseTest } from "../fixtures";

export interface BasePropertyEditorFixtures {
    propertyEditorService: PropertyEditorService;
}

export const test = baseTest
    .extend<BasePropertyEditorFixtures>({
        propertyEditorService: async ({ entryEditorService }, use) => {
            await use(entryEditorService.properties);
        },
    })
    .override({
        entryType: EntryType.Person,
        entryViewType: EntryViewType.PropertyEditor,
        entryEditorMocks: async ({ mockedEntryProperties }, use) => {
            await use(null);
        },
    });
