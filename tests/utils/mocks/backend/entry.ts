import {
    CommandNames,
    EntryArticleResponse,
    EntryInfoResponse,
    EntryPropertyResponse,
    BackendEntryPropertyResponse,
} from "@/domain";
import { compareStrings } from "@/utils/string";

import { MockedInvoker } from "./invoker";

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
    const entryType = entry.info.entityType;
    const rawResponse: BackendEntryPropertyResponse = {
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

export function mockGetEntryArticle(
    mockedInvoker: MockedInvoker,
    entry: EntryArticleResponse,
) {
    mockedInvoker.mockCommand(CommandNames.Entry.GetArticle, async () => entry);
}

export function mockGetEntries(
    mockedInvoker: MockedInvoker,
    entries: EntryInfoResponse[],
) {
    mockedInvoker.mockCommand(CommandNames.Entry.GetAll, async () => entries);
}

export function mockSearchEntries(
    mockedInvoker: MockedInvoker,
    entries: EntryInfoResponse[],
) {
    const search = async ({ keyword }: { keyword: string }) => {
        return entries
            .filter((e) => e.title.includes(keyword))
            .sort((a, b) => compareStrings(a.title, b.title));
    };
    mockedInvoker.mockCommand(CommandNames.Entry.Search, search);
}
