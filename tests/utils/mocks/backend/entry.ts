import { EntryInfoResponse } from "@/schema";
import { MockedInvoker } from "./invoker";
import { CommandNames } from "@/constants";

export interface MockGetEntriesArguments {
    entities: EntryInfoResponse[];
}

export function mockGetEntries(
    mockedInvoker: MockedInvoker,
    { entities }: MockGetEntriesArguments,
) {
    mockedInvoker.mockCommand(CommandNames.Entry.GetAll, async () => entities);
}
