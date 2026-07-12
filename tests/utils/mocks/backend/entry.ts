import {
    CommandNames,
    type EntryArticleResponse,
    type EntryInfoResponse,
    type EntryPropertyResponse,
    type BackendEntryPropertyResponse,
    type BackendEntryUpdate,
    type EntryUpdateResponse,
    type DiagnosticResponse,
    type WordUpsertResponse,
    type EntrySearch,
} from "@/api";
import { compareStrings } from "@/utils/string";

import { MockedCommand, MockedInvoker } from "./invoker";

export function mockBulkUpdateEntries(
    mockedInvoker: MockedInvoker,
    responses?: Record<string, Partial<EntryUpdateResponse>>,
) {
    const createResponse = (entry: BackendEntryUpdate) => {
        if (responses?.[entry.id]) return responses[entry.id];

        const wordResponses =
            entry.words?.map((word) => {
                const wordResponse: WordUpsertResponse = {
                    id: word.id,
                    status: {
                        created: word.id === null,
                        updated: word.id !== null,
                    },
                };
                return wordResponse;
            }) ?? [];

        return {
            id: entry.id,
            folderId: {
                updated: entry.folderId !== null,
            },
            title: {
                updated: entry.title !== null,
                isUnique: true,
            },
            properties: {
                updated: entry.properties !== null,
            },
            text: {
                updated: entry.text !== null,
            },
            words: wordResponses,
        } as EntryUpdateResponse;
    };

    const createResponses = async ({
        entries,
    }: {
        entries: BackendEntryUpdate[];
    }) => {
        return entries.map(
            (entry) =>
                ({
                    data: createResponse(entry),
                    errors: [],
                }) as DiagnosticResponse<EntryUpdateResponse>,
        );
    };

    mockedInvoker.mockCommand(
        CommandNames.Entry.BulkUpdate,
        createResponses as MockedCommand,
    );
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
    mockedInvoker.mockResponse(CommandNames.Entry.GetArticle, entry.info.id, {
        data: entry,
        errors: [],
    });
    mockedInvoker.mockCommand(
        CommandNames.Entry.GetArticle,
        // @ts-ignore
        async ({ id }) =>
            mockedInvoker.getResponse(CommandNames.Entry.GetArticle, id),
    );
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
    const search = async ({ query }: { query: EntrySearch }) => {
        return entries
            .filter((e) => e.title.includes(query.keyword))
            .sort((a, b) => compareStrings(a.title, b.title));
    };
    mockedInvoker.mockCommand(CommandNames.Entry.Search, search);
}
