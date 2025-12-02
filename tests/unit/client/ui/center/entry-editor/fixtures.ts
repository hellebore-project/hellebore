import { Id } from "@/interface";
import { test as baseTest } from "@tests/unit/fixtures";

interface EntryEditorFixtures {
    entryId: Id;
}

export const test = baseTest.extend<EntryEditorFixtures>({
    // data
    entryId: [1, { injected: true }],
});
