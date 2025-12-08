import { EntryInfoResponse } from "@/domain/schema";
import { CommandNames } from "@/domain/constants";

import { MockedInvoker } from "./invoker";

export interface MockGetEntriesArgs {
    entities: EntryInfoResponse[];
}

export function mockGetEntries(
    mockedInvoker: MockedInvoker,
    { entities }: MockGetEntriesArgs,
) {
    mockedInvoker.mockCommand(CommandNames.Entry.GetAll, async () => entities);
}
