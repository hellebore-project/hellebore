import { EntityType, EntryInfoResponse } from "@/domain";
import { Id } from "@/interface";
import { test as baseTest } from "@tests/unit/fixtures";
import { mockGetEntryInfo } from "@tests/utils/mocks";

interface EntryEditorFixtures {
    folderId: Id;
    entryId: Id;
    entryType: EntityType;
    entryTitle: string;
    entry: EntryInfoResponse;
}

export const test = baseTest.extend<EntryEditorFixtures>({
    // data
    folderId: 1,
    entryId: 1,
    entryType: EntityType.ENTRY,
    entryTitle: "mocked-title",
    entry: async (
        { mockedInvoker, entryId, entryType, folderId, entryTitle },
        use,
    ) => {
        const entry: EntryInfoResponse = {
            id: entryId,
            entity_type: entryType,
            folder_id: folderId,
            title: entryTitle,
        };
        mockGetEntryInfo(mockedInvoker, entry);
        use(entry);
    },
});
