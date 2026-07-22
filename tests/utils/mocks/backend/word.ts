import { Id } from "@/interface";
import {
    CommandNames,
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

export function mockGetWords(
    mockedInvoker: MockedInvoker,
    words: WordResponse[] = [],
) {
    const command = async ({
        languageId,
        wordType,
    }: {
        languageId: Id;
        wordType: WordType | null;
    }) => {
        return words.filter(
            (w) =>
                w.languageId === languageId &&
                (wordType === null || w.wordType === wordType),
        );
    };
    mockedInvoker.mockCommand(
        CommandNames.Word.GetMany,
        command as MockedCommand,
    );
}

export function mockDeleteWord(
    mockedInvoker: MockedInvoker,
    f: (() => void) | null = null,
) {
    mockedInvoker.mockCommand(CommandNames.Word.Delete, async () => {
        f?.();
    });
}
