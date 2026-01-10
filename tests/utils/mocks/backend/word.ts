import { CommandNames, WordType } from "@/constants";
import { Id } from "@/interface";
import { WordResponse, WordUpsert, BackendApiError } from "@/domain/schema";

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
        languageId: number;
        wordType: WordType | null;
    }) => {
        return words.map((w) => ({
            ...w,
            languageId: languageId,
            wordType: wordType ?? WordType.RootWord,
        }));
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
