import { Id } from "@/interface";
import {
    CommandNames,
    type BackendApiError,
    type PaginatedWordResponse,
    type WordQuery,
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

export function mockGetWords(
    mockedInvoker: MockedInvoker,
    words: WordResponse[] = [],
) {
    const command = async ({ query }: { query: WordQuery }) => {
        const filteredWords = words.filter((word) => {
            if (word.languageId !== query.languageId) return false;
            if (
                query.wordTypes !== null &&
                !query.wordTypes.includes(word.wordType)
            ) {
                return false;
            }
            if (
                query.spelling !== null &&
                !word.spelling.includes(query.spelling)
            ) {
                return false;
            }
            if (
                query.definition !== null &&
                !word.definition.includes(query.definition)
            ) {
                return false;
            }
            if (
                query.translations !== null &&
                !word.translations.some((translation) =>
                    translation.includes(query.translations ?? ""),
                )
            ) {
                return false;
            }
            return true;
        });

        const start = query.pageIndex * query.itemsPerPageCount;
        const data = filteredWords.slice(
            start,
            start + query.itemsPerPageCount,
        );
        const totalItems = filteredWords.length;
        const totalPages = Math.max(
            1,
            Math.ceil(totalItems / query.itemsPerPageCount),
        );

        const response: PaginatedWordResponse = {
            data,
            pageIndex: query.pageIndex,
            itemsPerPageCount: query.itemsPerPageCount,
            totalItemCount: totalItems,
            totalPageCount: totalPages,
        };

        return response;
    };

    mockedInvoker.mockCommand(
        CommandNames.Word.GetMany,
        command as MockedCommand,
    );
}

export function mockDeleteWord(mockedInvoker: MockedInvoker) {
    mockedInvoker.mockCommand(CommandNames.Word.Delete, async () => {
        /* no-op */
    });
}
