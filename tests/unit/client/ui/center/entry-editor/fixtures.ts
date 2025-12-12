import { EntityType, EntryInfoResponse } from "@/domain";
import { Id } from "@/interface";
import { test as baseTest } from "@tests/unit/fixtures";
import { mockGetEntryInfo } from "@tests/utils/mocks";

interface EntryEditorFixtures {
    folderId: Id;
    entryId: Id;
    entryType: EntityType;
    entryTitle: string;
    entryInfo: EntryInfoResponse;
    mockedEntryInfo: EntryInfoResponse;
}

export const test = baseTest.extend<EntryEditorFixtures>({
    // data
    folderId: 1,
    entryId: 1,
    entryType: EntityType.ENTRY,
    entryTitle: "mocked-title",
    entryInfo: async ({ entryId, entryType, folderId, entryTitle }, use) => {
        const entry: EntryInfoResponse = {
            id: entryId,
            entity_type: entryType,
            folder_id: folderId,
            title: entryTitle,
        };
        use(entry);
    },
    mockedEntryInfo: async ({ mockedInvoker, entryInfo }, use) => {
        mockGetEntryInfo(mockedInvoker, entryInfo);
        use(entryInfo);
    },
});
