import { EntryInfoResponse } from "@/domain";
import { test as baseTest } from "@tests/unit/client/fixtures";
import { mockGetEntryInfo } from "@tests/utils/mocks";

interface EntryEditorFixtures {
    mockedEntryInfo: EntryInfoResponse;
}

export const test = baseTest.extend<EntryEditorFixtures>({
    // mocking
    mockedEntryInfo: async ({ mockedInvoker, entryInfo }, use) => {
        mockGetEntryInfo(mockedInvoker, entryInfo);
        use(entryInfo);
    },
});
