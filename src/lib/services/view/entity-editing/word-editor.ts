import { makeAutoObservable, toJS } from "mobx";

import {
    GrammaticalGender,
    GrammaticalNumber,
    GrammaticalPerson,
    VerbForm,
    VerbTense,
    WordKey,
    WordResponse,
    WordData,
    WordType,
    WordUpsertResponse,
    Id,
} from "@/interface";
import { compareStrings } from "@/utils/string";
import { Counter } from "@/utils/counter";
import { ViewManagerInterface } from "../interface";
import { EntityInfoEditor } from "./info-editor";

type AdditionalKeys = "_modifiedWordKeys" | "_wordKeyGenerator";

export class WordEditor {
    private _wordType: WordType | null = null;
    private _words: { [key: WordKey]: WordData };
    private _filteredWordKeys: WordKey[];
    private _modifiedWordKeys: Set<WordKey>;
    private _changed: boolean = false;
    private _wordKeyGenerator: Counter;

    view: ViewManagerInterface;
    info: EntityInfoEditor;

    constructor(view: ViewManagerInterface, info: EntityInfoEditor) {
        makeAutoObservable<WordEditor, AdditionalKeys>(this, {
            view: false,
            info: false,
            _modifiedWordKeys: false,
            _wordKeyGenerator: false,
        });

        this._words = {};
        this._filteredWordKeys = [];
        this._modifiedWordKeys = new Set();
        this._wordKeyGenerator = new Counter();

        this.view = view;
        this.info = info;
    }

    get languageId() {
        return this.info.id;
    }

    get wordType() {
        return this._wordType;
    }

    set wordType(type: WordType | null) {
        this._wordType = type;
    }

    get newKey() {
        return this.convertIndexToWordKey(this._wordKeyGenerator.index);
    }

    get filteredKeys() {
        return toJS(this._filteredWordKeys);
    }

    get changed() {
        return this._changed;
    }

    idToKey(id: number) {
        return String(id);
    }

    convertIndexToWordKey(index: number) {
        return `N${index}`;
    }

    getWord(key: WordKey) {
        return toJS(this._words[key]);
    }

    setSpelling(key: WordKey, spelling: string) {
        this._words[key].spelling = spelling;
        if (key == this.newKey && spelling) this._addNewWordRow();
    }

    getTranslations(key: WordKey) {
        return this._words[key].translations.join(", ");
    }

    setTranslations(key: WordKey, translations: string) {
        this._words[key].translations = translations
            .split(/,|;/)
            .map((s) => s.trim());
        if (key == this.newKey && translations) this._addNewWordRow();
    }

    isWordHighlighted(key: WordKey) {
        return Boolean(this._words[key].highlighted);
    }

    highlightWord(key: WordKey) {
        this._words[key].highlighted = true;
    }

    unhighlightWord(key: WordKey) {
        this._words[key].highlighted = false;
    }

    claimModifiedWords() {
        const modifiedWords = [];
        for (const key in this._modifiedWordKeys)
            modifiedWords.push(this._words[key]);
        this._modifiedWordKeys.clear();
        return modifiedWords;
    }

    initialize(languageId: number, wordType: WordType) {
        this._wordType = wordType;
        this.view.domain.words
            .getAllForLanguage(languageId, wordType)
            .then((words) => this._setWords(words));
    }

    sync(words: WordData[]) {
        this._changed = false;
        if (words) {
            for (const word of words) {
                if (!word.created && !word.updated)
                    this._modifiedWordKeys.add(word.key);
                else if (word.created) this._words[word.key].id = word.id;
            }
        }
    }

    reset() {
        this._wordType = null;
        this._words = {};
        this._filteredWordKeys = [];
    }

    private _setWords(words: WordResponse[] | null) {
        if (!words) return;

        const mapping: { [key: WordKey]: WordData } = {};
        for (const word of words) {
            const wordRow = this._createWordRow(word);
            mapping[wordRow.key] = wordRow;
        }

        this._words = mapping;
        this._filteredWordKeys = Object.values(mapping)
            .sort((a, b) => compareStrings(a.spelling, b.spelling))
            .map((w) => w.key);

        this._addNewWordRow();
    }

    private _createWordRow(word: WordResponse): WordData {
        return {
            key: this.idToKey(word.id),
            ...word,
        };
    }

    private _addNewWordRow() {
        const newWord: WordData = {
            key: this.convertIndexToWordKey(this._wordKeyGenerator.increment()),
            id: null,
            language_id: this.languageId,
            word_type: this.wordType as WordType,
            spelling: "",
            number: GrammaticalNumber.None,
            person: GrammaticalPerson.None,
            gender: GrammaticalGender.None,
            verb_form: VerbForm.None,
            verb_tense: VerbTense.None,
            translations: [],
        };
        this._words[newWord.key] = newWord;
        this._filteredWordKeys.push(newWord.key);
    }
}
