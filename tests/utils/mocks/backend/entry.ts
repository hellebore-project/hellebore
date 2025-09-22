import { EntryInfoResponse } from "@/domain/schema";
import { CommandNames } from "@/domain/constants";

import { MockedInvoker } from "./invoker";

export interface MockGetEntriesArguments {
    entities: EntryInfoResponse[];
}

export function mockGetEntries(
    mockedInvoker: MockedInvoker,
    { entities }: MockGetEntriesArguments,
) {
    mockedInvoker.mockCommand(CommandNames.Entry.GetAll, async () => entities);
}
