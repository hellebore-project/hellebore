import { Id } from "@/interface";
import {
    CommandNames,
    QueryRequest,
    QueryResponse,
    WordQueryOptions,
    WordProperty,
    WordType,
    type BackendApiError,
    type WordResponse,
    type WordUpsert,
} from "@/api";

import { MockedCommand, MockedInvoker } from "./invoker";
import { query } from "./query";

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
    const PROPERTY_MAPPING: Partial<Record<WordProperty, string>> = {
        [WordProperty.Id]: "id",
        [WordProperty.LanguageId]: "languageId",
        [WordProperty.WordType]: "wordType",
        [WordProperty.Spelling]: "spelling",
        [WordProperty.Definition]: "definition",
        [WordProperty.Translations]: "translations",
    };

    const command = async ({
        args,
    }: {
        args: QueryRequest<WordProperty, WordQueryOptions>;
    }) => {
        return query({
            items: words,
            args,
            propertyMapping: PROPERTY_MAPPING,
        });
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
