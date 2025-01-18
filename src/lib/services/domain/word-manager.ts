import { invoke } from "@tauri-apps/api/core";
import { makeAutoObservable } from "mobx";

import {
    WordResponse,
    WordUpdate,
    WordUpdateResponse,
    ResponseWithDiagnostics,
    WordCreate,
    WordType,
    IdentifiedObject,
    GrammaticalNumber,
    GrammaticalPerson,
    GrammaticalGender,
    VerbForm,
    VerbTense,
} from "@/interface";

export interface WordUpdateArguments extends IdentifiedObject {
    language_id?: number | null;
    word_type?: WordType | null;
    spelling?: string | null;
    number?: GrammaticalNumber | null;
    person?: GrammaticalPerson | null;
    gender?: GrammaticalGender | null;
    verb_form?: VerbForm | null;
    verb_tense?: VerbTense | null;
    translations?: string[] | null;
}

export class WordManager {
    constructor() {
        makeAutoObservable(this);
    }

    async create(
        language_id: number,
        word_type: WordType,
        spelling: string,
    ): Promise<WordResponse | null> {
        let response: WordResponse | null;
        try {
            response = await createWord({ language_id, word_type, spelling });
        } catch (error) {
            console.error(error);
            return null;
        }
        return response;
    }

    async update({
        id,
        language_id = null,
        word_type = null,
        spelling = null,
        number = null,
        person = null,
        gender = null,
        verb_form = null,
        verb_tense = null,
        translations = null,
    }: WordUpdateArguments): Promise<WordUpdateResponse | null> {
        const payload: WordUpdate = {
            id,
            language_id,
            word_type,
            spelling,
            number,
            person,
            gender,
            verb_form,
            verb_tense,
            translations,
        };
        let response: ResponseWithDiagnostics<null> | null;

        try {
            response = await updateWord(payload);
        } catch (error) {
            console.error(error);
            return null;
        }
        const updateResponse = this._buildUpdateResponse(payload, response);

        return updateResponse;
    }

    _buildUpdateResponse(
        wordUpdate: WordUpdate,
        response: ResponseWithDiagnostics<null>,
    ): WordUpdateResponse {
        const updateResponse: WordUpdateResponse = {
            ...wordUpdate,
        };
        return updateResponse;
    }

    async get(id: number): Promise<WordResponse | null> {
        try {
            return await getWord(id);
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

async function createWord(word: WordCreate): Promise<WordResponse> {
    return invoke<WordResponse>("create_word", { word });
}

async function updateWord(
    word: WordUpdate,
): Promise<ResponseWithDiagnostics<null>> {
    return invoke<ResponseWithDiagnostics<null>>("update_word", { word });
}

async function getWord(id: number): Promise<WordResponse> {
    return invoke<WordResponse>("get_word", { id });
}

async function deleteWord(id: number): Promise<void> {
    invoke<null>("delete_word", { id });
}
