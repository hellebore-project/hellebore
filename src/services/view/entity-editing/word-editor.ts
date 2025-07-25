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
    WordTableColumnKey,
    SpreadsheetRowData,
    SpreadsheetColumnData,
    FieldType,
} from "@/interface";
import { Counter } from "@/utils/counter";
import { ViewManagerInterface } from "../interface";
import { EntityInfoEditor } from "./info-editor";
import { numericEnumMapping } from "@/utils/enums";
import { SpreadsheetService } from "@/shared/spreadsheet";

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

const GRAMMATICAL_NUMBERS = Object.entries(
    numericEnumMapping(GrammaticalNumber),
).map(([k, v]) => ({ label: k, value: String(v) }));
const GRAMMATICAL_GENDERS = Object.entries(
    numericEnumMapping(GrammaticalGender),
).map(([k, v]) => ({ label: k, value: String(v) }));
const GRAMMATICAL_PERSONS = Object.entries(
    numericEnumMapping(GrammaticalPerson),
).map(([k, v]) => ({ label: k, value: String(v) }));

const COLUMN_ORDER = [
    WordTableColumnKey.Spelling,
    WordTableColumnKey.Translations,
    WordTableColumnKey.Gender,
    WordTableColumnKey.Number,
    WordTableColumnKey.Person,
];
const COLUMN_DATA_MAPPING = {
    [WordTableColumnKey.Spelling]: {
        key: WordTableColumnKey.Spelling,
        type: FieldType.TEXT,
        label: "Spelling",
    },
    [WordTableColumnKey.Translations]: {
        key: WordTableColumnKey.Translations,
        type: FieldType.TEXT,
        label: "Translations",
    },
    [WordTableColumnKey.Gender]: {
        key: WordTableColumnKey.Gender,
        type: FieldType.SELECT,
        label: "Gender",
        options: GRAMMATICAL_GENDERS,
        defaultValue: String(GrammaticalGender.None),
    },
    [WordTableColumnKey.Number]: {
        key: WordTableColumnKey.Number,
        type: FieldType.SELECT,
        label: "Number",
        options: GRAMMATICAL_NUMBERS,
        defaultValue: String(GrammaticalNumber.None),
    },
    [WordTableColumnKey.Person]: {
        key: WordTableColumnKey.Person,
        type: FieldType.SELECT,
        label: "Person",
        options: GRAMMATICAL_PERSONS,
        defaultValue: String(GrammaticalPerson.None),
    },
};

type PrivateKeys =
    | "_columnData"
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
    // STATE VARIABLES
    private _wordType: WordType = WordType.RootWord;
    private _words: { [key: WordKey]: WordData };
    private _modifiedWordKeys: Set<WordKey>;
    private _changed: boolean = false;

    // SERVICES
    private _view: ViewManagerInterface;
    private _info: EntityInfoEditor;
    spreadsheet: SpreadsheetService;

    // UTILITIES
    private _wordKeyGenerator: Counter;

    // CALLBACKS
    private _onChange: EntityChangeHandler;

    // CONSTRUCTION
    constructor({ view, info, onChange }: WordEditorSettings) {
        makeAutoObservable<WordEditor, PrivateKeys>(this, {
            _modifiedWordKeys: false,
            _columnData: false,
            _wordKeyGenerator: false,
            _onChange: false,
            _view: false,
            _info: false,
            spreadsheet: false,
        });

        this._words = {};
        this._modifiedWordKeys = new Set();

        this._view = view;
        this._info = info;
        this.spreadsheet = new SpreadsheetService({
            onEditCell: (r, c, v) => this.editWord(r, c, v),
            onDeleteRow: (k) => this.deleteWord(k),
        });
        this._wordKeyGenerator = new Counter();
        this._onChange = onChange;
    }

    // PROPERTIES

    get languageId() {
        return this._info.id;
    }

    get wordType() {
        return this._wordType;
    }

    get viewKey(): WordViewKey {
        if (this._wordType == WordType.None) return WordViewKey.RootWords;
        return TYPE_TO_VIEW_MAPPING.get(this._wordType) as WordViewKey;
    }

    get newKey() {
        return this.convertIndexToWordKey(this._wordKeyGenerator.index);
    }

    get changed() {
        return this._changed;
    }

    // STATE MANAGEMENT

    async initialize(
        languageId: number,
        wordType: WordType = WordType.RootWord,
    ) {
        if (wordType !== undefined) this._wordType = wordType;
        return this._view.domain.words
            .getAllForLanguage(languageId, wordType)
            .then((words) => this._setWords(words));
    }

    private _setWords(words: WordResponse[] | null) {
        if (!words) words = [];

        const mapping: { [key: WordKey]: WordData } = {};
        for (const word of words) {
            const wordRow = this._convertResponseToData(word);
            mapping[wordRow.key] = wordRow;
        }

        this._words = mapping;

        this._initializeSpreadsheet(Object.values(mapping));
    }

    private _initializeSpreadsheet(words: WordData[]) {
        const rowData = words.map((w) => this._convertWordToRow(w));
        const colData = this._getColumnData();
        this.spreadsheet.initialize(rowData, colData);
        this._addNewWordRow();
    }

    reset() {
        this._words = {};
    }

    changeView(viewKey: WordViewKey) {
        const wordType = VIEW_TO_TYPE_MAPPING.get(viewKey) as WordType;
        return this._view.openWordEditor(this.languageId, wordType);
    }

    sync(words: WordData[]) {
        this._changed = false;
        if (words) {
            for (const word of words) {
                if (!this._words.hasOwnProperty(word.key)) continue; // word type changed after the sync was requested
                if (!word.created && !word.updated)
                    // word was not created or updated successfully
                    this._modifiedWordKeys.add(word.key);
                else if (word.created)
                    // new word was created; store the ID
                    this._words[word.key].id = word.id;
            }
        }
    }

    private _onChangeWord(key: WordKey) {
        if (key == this.newKey) this._addNewWordRow();
        else this._words[key] = this._words[key];
        this._modifiedWordKeys.add(key);
        this._changed = true;
        this._onChange();
    }

    claimModifiedWords() {
        const modifiedWords = [];
        for (const key of this._modifiedWordKeys) {
            const word = toJS(this._words[key]);
            if (word.rawTranslations)
                word.translations = word.rawTranslations
                    .split(/,|;/)
                    .map((s) => s.trim());
            else word.translations = [];
            modifiedWords.push(word);
        }
        this._modifiedWordKeys.clear();
        return modifiedWords;
    }

    cleanUp() {
        this._words = {};
        this._modifiedWordKeys.clear();
    }

    // INDEXING

    idToKey(id: number) {
        return String(id);
    }

    convertIndexToWordKey(index: number) {
        return `N${index}`;
    }

    // WORD EDITING

    setSpelling(key: WordKey, spelling: string) {
        this._words[key].spelling = spelling;
        this._onChangeWord(key);
    }

    setTranslations(key: WordKey, rawTranslations: string) {
        this._words[key].rawTranslations = rawTranslations;
        this._onChangeWord(key);
    }

    setNumber(key: WordKey, number_: number) {
        this._words[key].number = number_;
        this._onChangeWord(key);
    }

    setGender(key: WordKey, gender: number) {
        this._words[key].gender = gender;
        this._onChangeWord(key);
    }

    setPerson(key: WordKey, person: number) {
        this._words[key].person = person;
        this._onChangeWord(key);
    }

    editWord(rowKey: string, colKey: string, value: number | string | null) {
        switch (colKey) {
            case WordTableColumnKey.Spelling:
                this.setSpelling(rowKey, String(value ?? ""));
                break;
            case WordTableColumnKey.Translations:
                this.setTranslations(rowKey, String(value ?? ""));
                break;
            case WordTableColumnKey.Gender:
                this.setGender(rowKey, Number(value));
                break;
            case WordTableColumnKey.Number:
                this.setNumber(rowKey, Number(value));
                break;
            case WordTableColumnKey.Person:
                this.setPerson(rowKey, Number(value));
                break;
            default:
                break;
        }
    }

    // WORD CREATION

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
        this.spreadsheet.addRow(this._convertWordToRow(newWord));
    }

    // WORD DELETION

    deleteWord(key: WordKey) {
        const word = this._words[key];
        if (word.id !== null) this._view.domain.words.delete(word.id);
        delete this._words[key];
        this._modifiedWordKeys.delete(key);
    }

    // LAYOUT

    private _getColumnData(): SpreadsheetColumnData[] {
        const keys = this._getVisibleColumnKeys();
        const columns: SpreadsheetColumnData[] = [];
        for (const key of COLUMN_ORDER) {
            if (keys.has(key)) columns.push(COLUMN_DATA_MAPPING[key]);
        }
        return columns;
    }

    private _getVisibleColumnKeys() {
        switch (this.wordType) {
            case WordType.Article:
                return new Set([
                    WordTableColumnKey.Spelling,
                    WordTableColumnKey.Translations,
                    WordTableColumnKey.Gender,
                    WordTableColumnKey.Number,
                ]);
            case WordType.Pronoun:
                return new Set([
                    WordTableColumnKey.Person,
                    WordTableColumnKey.Gender,
                    WordTableColumnKey.Number,
                    WordTableColumnKey.Spelling,
                    WordTableColumnKey.Translations,
                ]);
            case WordType.Noun:
                return new Set([
                    WordTableColumnKey.Spelling,
                    WordTableColumnKey.Translations,
                    WordTableColumnKey.Gender,
                ]);
            default:
                return new Set([
                    WordTableColumnKey.Spelling,
                    WordTableColumnKey.Translations,
                ]);
        }
    }

    // UTILITIES

    private _convertResponseToData(word: WordResponse): WordData {
        return {
            key: this.idToKey(word.id),
            ...word,
            rawTranslations: word.translations?.join(", ") ?? "",
        };
    }

    private _convertWordToRow(word: WordData): SpreadsheetRowData {
        return {
            key: word.key,
            highlighted: false,
            cells: {
                spelling: { value: word.spelling },
                translations: { value: word.rawTranslations },
                // NOTE: generating the label depends on typescript's reverse mapping for numeric enums
                gender: {
                    label: GrammaticalGender[word.gender],
                    value: String(word.gender),
                },
                number: {
                    label: GrammaticalNumber[word.number],
                    value: String(word.number),
                },
                person: {
                    label: GrammaticalPerson[word.person],
                    value: String(word.person),
                },
            },
        };
    }
}
