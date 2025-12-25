import { invoke } from "@tauri-apps/api/core";

import { CommandNames, WordType } from "@/domain/constants";
import {
    BackendWordUpsertResponse,
    DiagnosticResponse,
    WordResponse,
    WordUpsert,
    WordUpsertResponse,
} from "@/domain";

type _WordBulkUpsertResponse = DiagnosticResponse<BackendWordUpsertResponse>[];

export class WordManager {
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

        return responses.map((response, i) => {
            return this._buildUpsertResponse(words[i], response);
        });
    }

    async getAllForLanguage(
        languageId: number,
        wordType?: WordType | null,
    ): Promise<WordResponse[] | null> {
        try {
            return await this._getWords(languageId, wordType ?? null);
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    async delete(id: number): Promise<boolean> {
        try {
            await this._deleteWord(id);
        } catch (error) {
            console.error(error);
            console.error(`Unable to delete word ${id}.`);
            return false;
        }
        return true;
    }

    private _buildUpsertResponse(
        upsertPayload: WordUpsert,
        rawResponse: DiagnosticResponse<BackendWordUpsertResponse>,
    ): WordUpsertResponse {
        let id = upsertPayload.id;
        if (rawResponse.data.id !== null) id = rawResponse.data.id;

        const created = rawResponse.data.status.created;
        const updated = rawResponse.data.status.updated;

        return {
            ...upsertPayload,
            id,
            created,
            updated,
        };
    }

    async _bulkUpsertWords(
        words: WordUpsert[],
    ): Promise<_WordBulkUpsertResponse> {
        return invoke<_WordBulkUpsertResponse>(CommandNames.Word.BulkUpsert, {
            words,
        });
    }

    async _getWords(
        languageId: number,
        wordType: WordType | null,
    ): Promise<WordResponse[]> {
        return invoke<WordResponse[]>(CommandNames.Word.GetMany, {
            languageId,
            wordType,
        });
    }

    async _deleteWord(id: number): Promise<void> {
        return invoke<void>(CommandNames.Word.Delete, { id });
    }
}
