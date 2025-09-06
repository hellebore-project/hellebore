import { CommandNames, WordType } from "@/constants";
import { Id } from "@/interface";
import { WordResponse, WordUpsert, ApiError } from "@/schema";
import { MockedInvoker } from "./invoker";

export function mockUpsertWords(
    mockedInvoker: MockedInvoker,
    wordIds: Id[] | null = null,
    errors: Array<ApiError[]> | null = null,
) {
    wordIds = wordIds ?? [];
    errors = errors ?? [];

    mockedInvoker.mockCommand(
        CommandNames.Word.BulkUpsert,
        async ({ words }: { words: WordUpsert[] }) => {
            return words.map((w, i) => ({
                data: w.id ?? wordIds[i],
                errors: errors[i] ?? [],
            }));
        },
    );
}

export function mockGetWords(
    mockedInvoker: MockedInvoker,
    words: WordResponse[] = [],
) {
    mockedInvoker.mockCommand(
        CommandNames.Word.GetMany,
        async ({
            languageId,
            wordType,
        }: {
            languageId: number;
            wordType: WordType | null;
        }) => {
            return words.map((w) => ({
                ...w,
                language_id: languageId,
                word_type: wordType ?? WordType.RootWord,
            }));
        },
    );
}

export function mockDeleteWord(mockedInvoker: MockedInvoker) {
    mockedInvoker.mockCommand(CommandNames.Word.Delete, async () => {});
}
