import {
    CommandNames,
    type BackendEntryCreate,
    type EntryArticleResponse,
    type EntryInfoResponse,
    type EntryPropertyResponse,
    type BackendEntryPropertyResponse,
    type BackendEntryUpdate,
    type EntryUpdateResponse,
    type DiagnosticResponse,
    type WordUpsertResponse,
    type EntryListRequest,
    type QueryRequest,
    QueryResponse,
} from "@/api";
import { Id } from "@/interface";
import { compareStrings } from "@/utils/string";

import { MockedCommand, MockedInvoker } from "./invoker";
import { AddMockedCommandArgs } from "./interface";

export function mockCreateEntry({
    mockedInvoker,
    entryId = "entry1",
    error,
}: AddMockedCommandArgs & { entryId?: Id }) {
    const command = async ({
        entry: { folderId, entityType, title },
    }: BackendEntryCreate) => {
        if (error) throw error;

        const response: EntryInfoResponse = {
            id: entryId,
            folderId,
            entityType,
            title,
        };
        return response;
    };

    mockedInvoker.mockCommand(
        CommandNames.Entry.Create,
        command as MockedCommand,
    );
}

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

export function mockListEntries(
    mockedInvoker: MockedInvoker,
    entries: EntryInfoResponse[],
) {
    const search = async ({
        args,
    }: {
        args: QueryRequest<EntryListRequest> | null;
    }) => {
        if (args?.data.keyword)
            entries = entries.filter((e) =>
                e.title.includes(args?.data.keyword),
            );

        entries = entries
            .sort((a, b) => compareStrings(a.title, b.title))
            .slice(args?.pagination?.offset ?? undefined)
            .slice(0, args?.pagination?.limit ?? undefined);

        const response: QueryResponse<EntryInfoResponse> = {
            items: entries,
            page_index: args?.pagination?.page_index ?? 0,
            page_count: 1,
            total: args?.include_total ? entries.length : null,
            offset: args?.pagination?.offset ?? null,
            limit: args?.pagination?.limit ?? null,
        };
        return response;
    };
    mockedInvoker.mockCommand(CommandNames.Entry.List, search);
}
