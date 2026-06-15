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
    private _projectId: string;

    constructor(projectId: string) {
        this._projectId = projectId;
    }

    async bulkUpsert(
        words: WordUpsert[],
    ): Promise<WordUpsertResponse[] | null> {
        let responses: _WordBulkUpsertResponse;
        try {
            responses = await this._bulkUpsertWords(
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
        languageId: Id,
        wordType?: WordType | null,
    ): Promise<WordResponse[] | null> {
        try {
            return await this._getWords(languageId, wordType ?? null);
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    async delete(id: Id): Promise<boolean> {
        try {
            await this._deleteWord(id);
        } catch (error) {
            console.error(error);
            console.error(`Unable to delete word ${id}.`);
            return false;
        }
        return true;
    }

    async _bulkUpsertWords(
        words: WordUpsert[],
    ): Promise<_WordBulkUpsertResponse> {
        return invoke<_WordBulkUpsertResponse>(CommandNames.Word.BulkUpsert, {
            projectId: this._projectId,
            words,
        });
    }

    async _getWords(
        languageId: Id,
        wordType: WordType | null,
    ): Promise<WordResponse[]> {
        return invoke<WordResponse[]>(CommandNames.Word.GetMany, {
            projectId: this._projectId,
            languageId,
            wordType,
        });
    }

    async _deleteWord(id: Id): Promise<void> {
        return invoke<void>(CommandNames.Word.Delete, {
            projectId: this._projectId,
            id,
        });
    }
}
