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
    type PaginationRequest,
    PaginationResponse,
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
        args: PaginationRequest<EntryListRequest> | null;
    }) => {
        if (args?.data.keyword)
            entries = entries.filter((e) =>
                e.title.includes(args?.data.keyword),
            );

        entries = entries
            .sort((a, b) => compareStrings(a.title, b.title))
            .slice(args?.offset ?? undefined)
            .slice(0, args?.limit ?? undefined);

        const response: PaginationResponse<EntryInfoResponse> = {
            items: entries,
            page_index: args?.page_index ?? 0,
            page_count: 1,
            item_count: entries.length,
            total: args?.include_total ? entries.length : null,
            offset: args?.offset ?? null,
            limit: args?.limit ?? null,
        };
        return response;
    };
    mockedInvoker.mockCommand(CommandNames.Entry.List, search);
}
