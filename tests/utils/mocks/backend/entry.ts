import { EntryInfoResponse } from "@/schema";
import { MockedInvoker } from "./invoker";

export interface MockGetEntriesArguments {
    entities: EntryInfoResponse[];
}

export function mockGetEntries(
    mockedInvoker: MockedInvoker,
    { entities }: MockGetEntriesArguments,
) {
    mockedInvoker.mockCommand("get_entries", async () => entities);
}
