import { invoke } from "@tauri-apps/api/core";
import { makeAutoObservable } from "mobx";

import {
    WordResponse,
    WordUpsertResponse,
    ResponseWithDiagnostics,
    WordType,
    Id,
    WordUpsert,
} from "@/interface";

export type UpsertWordResponse = ResponseWithDiagnostics<Id | null>;
export type BulkUpsertWordsResponse = Array<UpsertWordResponse>;

export class WordManager {
    constructor() {
        makeAutoObservable(this);
    }

    async bulkUpsert(
        words: WordUpsert[],
    ): Promise<WordUpsertResponse[] | null> {
        let responses: BulkUpsertWordsResponse;
        try {
            responses = await bulkUpsertWords(
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

    _buildUpsertResponse(
        upsertPayload: WordUpsert,
        response: ResponseWithDiagnostics<Id | null>,
    ): WordUpsertResponse {
        let id = upsertPayload.id;
        let created = false;
        let updated = false;
        if (id == null) {
            id = response.data;
            created = id != null;
        } else updated = response.data != null;
        return {
            ...upsertPayload,
            id,
            created,
            updated,
        };
    }

    async get(id: number): Promise<WordResponse | null> {
        try {
            return await getWord(id);
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
            return await getWords(languageId, wordType ?? null);
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    async delete(id: number): Promise<boolean> {
        try {
            await deleteWord(id);
        } catch (error) {
            console.error(error);
            console.error(`Unable to delete word ${id}.`);
            return false;
        }
        return true;
    }
}

async function bulkUpsertWords(
    words: Array<WordUpsert>,
): Promise<BulkUpsertWordsResponse> {
    return invoke<BulkUpsertWordsResponse>("upsert_words", { words });
}

async function getWord(id: number): Promise<WordResponse> {
    return invoke<WordResponse>("get_word", { id });
}

async function getWords(
    languageId: number,
    wordType: WordType | null,
): Promise<WordResponse[]> {
    return invoke<WordResponse[]>("get_words", { languageId, wordType });
}

async function deleteWord(id: number): Promise<void> {
    invoke<null>("delete_word", { id });
}
