import { invoke } from "@tauri-apps/api/core";
import { makeAutoObservable } from "mobx";

import { WordType } from "@/constants";
import { Id } from "@/interface";
import {
    DiagnosticResponse,
    WordResponse,
    WordUpsert,
    WordUpsertResponse,
} from "@/schema";

type _UpsertWordResponse = DiagnosticResponse<Id | null>;
type _BulkUpsertWordsResponse = Array<_UpsertWordResponse>;

export class WordManager {
    constructor() {
        makeAutoObservable(this);
    }

    async bulkUpsert(
        words: WordUpsert[],
    ): Promise<WordUpsertResponse[] | null> {
        let responses: _BulkUpsertWordsResponse;
        try {
            responses = await this._bulkUpsertWords(
                words.map((word) => ({
                    id: word.id,
                    language_id: word.language_id,
                    word_type: word.word_type,
                    spelling: word.spelling,
                    person: word.person,
                    gender: word.gender,
                    number: word.number,
                    verb_form: word.verb_form,
                    verb_tense: word.verb_tense,
                    translations: word.translations,
                })),
            );
        } catch (error) {
            console.error(error);
            return null;
        }

        return responses.map((response, i) => {
            return this._buildUpsertResponse(words[i], response);
        });
    }

    async get(id: number): Promise<WordResponse | null> {
        try {
            return await this._getWord(id);
        } catch (error) {
            console.error(error);
            return null;
        }
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
        rawResponse: DiagnosticResponse<Id | null>,
    ): WordUpsertResponse {
        let id = upsertPayload.id;
        let created = false;
        let updated = false;

        if (id == null) {
            id = rawResponse.data;
            created = id != null;
        } else updated = rawResponse.data != null;

        if (rawResponse.data !== null) {
            // upsert was successful
            id = rawResponse.data;
            if (upsertPayload.id === null) created = true;
            else updated = true;
        }

        return {
            ...upsertPayload,
            id,
            created,
            updated,
        };
    }

    async _bulkUpsertWords(
        words: Array<WordUpsert>,
    ): Promise<_BulkUpsertWordsResponse> {
        return invoke<_BulkUpsertWordsResponse>("upsert_words", { words });
    }

    async _getWord(id: number): Promise<WordResponse> {
        return invoke<WordResponse>("get_word", { id });
    }

    async _getWords(
        languageId: number,
        wordType: WordType | null,
    ): Promise<WordResponse[]> {
        return invoke<WordResponse[]>("get_words", { languageId, wordType });
    }

    async _deleteWord(id: number): Promise<void> {
        return invoke<void>("delete_word", { id });
    }
}
