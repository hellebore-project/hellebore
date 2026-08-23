import { invoke } from "@tauri-apps/api/core";

import type { Id } from "@/interface/common";

import { CommandNames, WordType } from "../constants";
import type {
    DiagnosticResponse,
    WordResponse,
    WordUpsert,
    WordUpsertResponse,
} from "../interface";

type _WordBulkUpsertResponse = DiagnosticResponse<WordUpsertResponse>[];

export class WordManager {
    async bulkUpsert(
        projectId: Id,
        words: WordUpsert[],
    ): Promise<WordUpsertResponse[] | null> {
        const wordPayloads = words.map((word) => ({
            id: word.id,
            languageId: word.languageId,
            wordType: word.wordType,
            spelling: word.spelling,
            definition: word.definition,
            translations: word.translations,
        }));

        let responses: _WordBulkUpsertResponse;
        try {
            responses = await invoke<_WordBulkUpsertResponse>(
                CommandNames.Word.BulkUpsert,
                {
                    projectId,
                    words: wordPayloads,
                },
            );
        } catch (error) {
            console.error(error);
            console.error("An error occurred during a bulk word upsert.");
            return null;
        }

        return responses.map((response) => ({
            id: response.data.id,
            status: response.data.status,
        }));
    }

    async getAllForLanguage(
        projectId: Id,
        languageId: Id,
        wordType: WordType | null = null,
    ): Promise<WordResponse[] | null> {
        try {
            return await invoke<WordResponse[]>(CommandNames.Word.GetMany, {
                projectId,
                languageId,
                wordType,
            });
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    async delete(projectId: Id, id: Id): Promise<boolean> {
        try {
            await invoke<void>(CommandNames.Word.Delete, {
                projectId,
                id,
            });
        } catch (error) {
            console.error(error);
            console.error(`Unable to delete word ${id}.`);
            return false;
        }
        return true;
    }
}
