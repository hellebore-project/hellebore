import {
    CommandNames,
    EntryInfoResponse,
    EntryPropertyResponse,
    RawEntryPropertyResponse,
} from "@/domain";

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

export function mockGetEntryProperties(
    mockedInvoker: MockedInvoker,
    entry: EntryPropertyResponse,
) {
    const entryType = entry.info.entity_type;
    const rawResponse: RawEntryPropertyResponse = {
        info: entry.info,
        properties: {
            [entryType]: entry.properties,
        },
    };
    mockedInvoker.mockCommand(
        CommandNames.Entry.GetProperties,
        async () => rawResponse,
    );
}

export function mockGetEntries(
    mockedInvoker: MockedInvoker,
    { entities }: MockGetEntriesArgs,
) {
    mockedInvoker.mockCommand(CommandNames.Entry.GetAll, async () => entities);
}
