import { CommandNames, EntryInfoResponse } from "@/domain";

import { MockedInvoker } from "./invoker";

export interface MockGetEntriesArgs {
    entities: EntryInfoResponse[];
}

export function mockGetEntryInfo(
    mockedInvoker: MockedInvoker,
    entry: EntryInfoResponse,
) {
    mockedInvoker.mockCommand(CommandNames.Entry.GetInfo, async () => entry);
}

export function mockGetEntries(
    mockedInvoker: MockedInvoker,
    { entities }: MockGetEntriesArgs,
) {
    mockedInvoker.mockCommand(CommandNames.Entry.GetAll, async () => entities);
}
