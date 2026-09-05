import { Id } from "@/interface";
import {
    CommandNames,
    QueryRequest,
    QueryResponse,
    WordListRequest,
    WordType,
    type BackendApiError,
    type WordResponse,
    type WordUpsert,
} from "@/api";

import { MockedCommand, MockedInvoker } from "./invoker";

export function mockUpsertWords(
    mockedInvoker: MockedInvoker,
    wordIds: Id[] | null = null,
    errors: BackendApiError[][] | null = null,
) {
    wordIds = wordIds ?? [];
    errors = errors ?? [];

    const command = async ({ words }: { words: WordUpsert[] }) => {
        return words.map((w, i) => ({
            data: w.id ?? wordIds[i],
            errors: errors[i] ?? [],
        }));
    };

    mockedInvoker.mockCommand(
        CommandNames.Word.BulkUpsert,
        command as MockedCommand,
    );
}

export function mockListWords(
    mockedInvoker: MockedInvoker,
    words: WordResponse[] = [],
) {
    const command = async ({
        args,
    }: {
        args: QueryRequest<WordListRequest>;
    }) => {
        words = words
            .filter(
                (w) =>
                    (!args.data.languageId ||
                        w.languageId === args.data.languageId) &&
                    (!args.data.wordTypes ||
                        args.data.wordTypes.includes(w.wordType)) &&
                    (!args.data.keyword ||
                        w.spelling.includes(args.data.keyword)),
            )
            .slice(args.pagination?.offset ?? 0)
            .slice(0, args.pagination?.limit ?? undefined);

        const response: QueryResponse<WordResponse> = {
            items: words,
            page_index: args?.pagination?.page_index ?? 0,
            page_count: 1,
            total: args?.include_total ? words.length : null,
            offset: args?.pagination?.offset ?? null,
            limit: args?.pagination?.limit ?? null,
        };
        return response;
    };

    mockedInvoker.mockCommand(CommandNames.Word.List, command as MockedCommand);
}

export function mockDeleteWord(
    mockedInvoker: MockedInvoker,
    f: (() => void) | null = null,
) {
    mockedInvoker.mockCommand(CommandNames.Word.Delete, async () => {
        f?.();
    });
}
