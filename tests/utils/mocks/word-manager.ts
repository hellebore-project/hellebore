import { vi } from "vitest";
import { WordManager } from "@/services/domain/word-manager";
import { WordResponse, WordUpsert, WordType, Id, ApiError } from "@/interface";

export function mockUpsertWords(
    manager: WordManager,
    wordIds: Id[] | null = null,
    errors: Array<ApiError[]> | null = null,
) {
    wordIds = wordIds ?? [];
    errors = errors ?? [];
    return vi
        .spyOn(manager, "_bulkUpsertWords")
        .mockImplementation(async (words: WordUpsert[]) =>
            words.map((w, i) => ({
                data: w.id ?? wordIds[i],
                errors: errors[i] ?? [],
            })),
        );
}

export function mockGetWords(manager: WordManager, words: WordResponse[] = []) {
    return vi
        .spyOn(manager, "_getWords")
        .mockImplementation(
            async (language_id: number, word_type: WordType | null) =>
                words.map((w) => ({
                    ...w,
                    language_id,
                    word_type: word_type ?? WordType.RootWord,
                })),
        );
}

export function mockDeleteWord(manager: WordManager) {
    return vi.spyOn(manager, "_deleteWord").mockImplementation(async () => {});
}
