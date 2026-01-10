import { CommandNames } from "@/constants";
import {
    EntryArticleResponse,
    EntryInfoResponse,
    EntryPropertyResponse,
    BackendEntryPropertyResponse,
    BackendEntryUpdate,
    EntryUpdateResponse,
    DiagnosticResponse,
    WordUpsertResponse,
    EntrySearch,
} from "@/interface";
import { compareStrings } from "@/utils/string";

import { MockedCommand, MockedInvoker } from "./invoker";

export function mockBulkUpdateEntries(mockedInvoker: MockedInvoker) {
    const command = async ({
        entries,
    }: {
        entries: BackendEntryUpdate[];
    }): Promise<DiagnosticResponse<EntryUpdateResponse>[]> => {
        return entries.map((entry) => {
            let wordResponses: WordUpsertResponse[] | null = null;
            if (entry.words) {
                wordResponses = entry.words.map((word) => {
                    const wordResponse: WordUpsertResponse = {
                        id: word.id,
                        status: {
                            created: word.id === null,
                            updated: word.id !== null,
                        },
                    };
                    return wordResponse;
                });
            }

            const response: DiagnosticResponse<EntryUpdateResponse> = {
                data: {
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
                },
                errors: [],
            };

            return response;
        });
    };

    mockedInvoker.mockCommand(
        CommandNames.Entry.BulkUpdate,
        command as MockedCommand,
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
    mockedInvoker.mockCommand(CommandNames.Entry.GetArticle, async () => ({
        data: entry,
        errors: [],
    }));
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
