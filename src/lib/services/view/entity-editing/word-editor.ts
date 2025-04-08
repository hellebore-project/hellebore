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
    EntityChangeHandler,
    WordViewKey,
} from "@/interface";
import { compareStrings } from "@/utils/string";
import { Counter } from "@/utils/counter";
import { ViewManagerInterface } from "../interface";
import { EntityInfoEditor } from "./info-editor";

const TYPE_TO_VIEW_MAPPING: Map<WordType, WordViewKey> = new Map([
    [WordType.RootWord, WordViewKey.RootWords],
    [WordType.Article, WordViewKey.Articles],
    [WordType.Preposition, WordViewKey.Prepositions],
    [WordType.Conjunction, WordViewKey.Conjunctions],
    [WordType.Pronoun, WordViewKey.Pronouns],
    [WordType.Noun, WordViewKey.Nouns],
    [WordType.Adjective, WordViewKey.Adjectives],
    [WordType.Adverb, WordViewKey.Adverbs],
    [WordType.Verb, WordViewKey.Verbs],
]);
const VIEW_TO_TYPE_MAPPING: Map<WordViewKey, WordType> = new Map(
    Array.from(TYPE_TO_VIEW_MAPPING, (entry) => [entry[1], entry[0]]),
);

type AdditionalKeys =
    | "_modifiedWordKeys"
    | "_wordKeyGenerator"
    | "_onChange"
    | "_view"
    | "_info";

interface WordEditorSettings {
    view: ViewManagerInterface;
    info: EntityInfoEditor;
    onChange: EntityChangeHandler;
}

export class WordEditor {
    // state
    private _wordType: WordType = WordType.None;
    private _words: { [key: WordKey]: WordData };
    private _filteredWordKeys: WordKey[];
    private _modifiedWordKeys: Set<WordKey>;
    private _changed: boolean = false;
    private _size: DOMRect;

    // utils
    private _view: ViewManagerInterface;
    private _info: EntityInfoEditor;
    private _wordKeyGenerator: Counter;
    private _onChange: EntityChangeHandler;

    constructor({ view, info, onChange }: WordEditorSettings) {
        makeAutoObservable<WordEditor, AdditionalKeys>(this, {
            _modifiedWordKeys: false,
            _wordKeyGenerator: false,
            _onChange: false,
            _view: false,
            _info: false,
        });

        this._words = {};
        this._filteredWordKeys = [];
        this._modifiedWordKeys = new Set();
        this._size = new DOMRect(0, 0, 0, 0);

        this._view = view;
        this._info = info;
        this._wordKeyGenerator = new Counter();
        this._onChange = onChange;
    }

    get viewKey(): WordViewKey {
        if (this._wordType == WordType.None) return WordViewKey.RootWords;
        return TYPE_TO_VIEW_MAPPING.get(this._wordType) as WordViewKey;
    }

    get languageId() {
        return this._info.id;
    }

    get wordType() {
        return this._wordType;
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

    get size() {
        console.log(`getting ${this._size.height}`);
        return this._size;
    }

    set size(size: DOMRect) {
        console.log(`setting ${size.height}`);
        this._size = size;
    }

    getWord(key: WordKey) {
        return toJS(this._words[key]);
    }

    setSpelling(key: WordKey, spelling: string) {
        this._words[key].spelling = spelling;
        this._onChangeWord(key);
    }

    getTranslations(key: WordKey) {
        return this._words[key].rawTranslations;
    }

    setTranslations(key: WordKey, rawTranslations: string) {
        this._words[key].rawTranslations = rawTranslations;
        this._onChangeWord(key);
    }

    initialize(languageId: number, wordType?: WordType) {
        if (wordType !== undefined) this._wordType = wordType;
        this._view.domain.words
            .getAllForLanguage(languageId, wordType)
            .then((words) => this._setWords(words));
    }

    sync(words: WordData[]) {
        this._changed = false;
        if (words) {
            for (const word of words) {
                if (!word.created && !word.updated)
                    // word was not created or updated successfully
                    this._modifiedWordKeys.add(word.key);
                else if (word.created)
                    // new word was created; store the ID
                    this._words[word.key].id = word.id;
            }
        }
    }

    reset() {
        this._words = {};
        this._filteredWordKeys = [];
    }

    changeView(viewKey: WordViewKey) {
        const wordType = VIEW_TO_TYPE_MAPPING.get(viewKey) as WordType;
        return this._view.openWordEditor(this.languageId, wordType);
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
        for (const key of this._modifiedWordKeys) {
            console.log(toJS(this._words));
            const word = toJS(this._words[key]);
            word.translations = word.rawTranslations
                .split(/,|;/)
                .map((s) => s.trim());
            modifiedWords.push(word);
        }
        this._modifiedWordKeys.clear();
        return modifiedWords;
    }

    deleteWord(key: WordKey) {
        const word = this._words[key];
        if (word.id !== null) this._view.domain.words.delete(word.id);
        delete this._words[key];
        this._filteredWordKeys = this._filteredWordKeys.filter((k) => k != key);
        this._modifiedWordKeys.delete(key);
    }

    idToKey(id: number) {
        return String(id);
    }

    convertIndexToWordKey(index: number) {
        return `N${index}`;
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
            rawTranslations: word.translations?.join(", ") ?? "",
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
            rawTranslations: "",
        };
        this._words[newWord.key] = newWord;
        this._filteredWordKeys.push(newWord.key);
    }

    private _onChangeWord(key: WordKey) {
        if (key == this.newKey) this._addNewWordRow();
        this._modifiedWordKeys.add(key);
        this._changed = true;
        this._onChange();
    }
}
