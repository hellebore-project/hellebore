import { invoke } from "@tauri-apps/api/core";

import { CommandNames, WordType } from "../constants";
import type {
    DiagnosticResponse,
    WordResponse,
    WordUpsert,
    WordUpsertResponse,
} from "../interface";
import type { Id } from "@/interface/common";

type _WordBulkUpsertResponse = DiagnosticResponse<WordUpsertResponse>[];

export class WordManager {
    async bulkUpsert(
        projectId: Id,
        words: WordUpsert[],
    ): Promise<WordUpsertResponse[] | null> {
        let responses: _WordBulkUpsertResponse;
        try {
            responses = await this._bulkUpsertWords(
                projectId,
                words.map((word) => ({
                    id: word.id,
                    languageId: word.languageId,
                    wordType: word.wordType,
                    spelling: word.spelling,
                    definition: word.definition,
                    translations: word.translations,
                })),
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
        wordType?: WordType | null,
    ): Promise<WordResponse[] | null> {
        try {
            return await this._getWords(
                projectId,
                languageId,
                wordType ?? null,
            );
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    async delete(projectId: Id, id: Id): Promise<boolean> {
        try {
            await this._deleteWord(projectId, id);
        } catch (error) {
            console.error(error);
            console.error(`Unable to delete word ${id}.`);
            return false;
        }
        return true;
    }

    async _bulkUpsertWords(
        projectId: Id,
        words: WordUpsert[],
    ): Promise<_WordBulkUpsertResponse> {
        return invoke<_WordBulkUpsertResponse>(CommandNames.Word.BulkUpsert, {
            projectId,
            words,
        });
    }

    async _getWords(
        projectId: Id,
        languageId: Id,
        wordType: WordType | null,
    ): Promise<WordResponse[]> {
        return invoke<WordResponse[]>(CommandNames.Word.GetMany, {
            projectId,
            languageId,
            wordType,
        });
    }

    async _deleteWord(projectId: Id, id: Id): Promise<void> {
        return invoke<void>(CommandNames.Word.Delete, {
            projectId,
            id,
        });
    }
}
