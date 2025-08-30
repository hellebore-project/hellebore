import { WordType } from "@/constants";
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
        "upsert_words",
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
        "get_words",
        async ({
            languageId,
            wordType,
        }: {
            languageId: number;
            wordType: WordType | null;
        }) => {
            return words.map((w) => ({
                ...w,
                languageId,
                word_type: wordType ?? WordType.RootWord,
            }));
        },
    );
}

export function mockDeleteWord(mockedInvoker: MockedInvoker) {
    mockedInvoker.mockCommand("delete_word", async () => {});
}
