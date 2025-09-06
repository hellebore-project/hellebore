import { makeAutoObservable } from "mobx";

import {
    GrammaticalGender,
    GrammaticalNumber,
    GrammaticalPerson,
    VerbForm,
    VerbTense,
    WordType,
    WordViewKey,
} from "@/constants";
import {
    EntityChangeHandler,
    IViewManager,
    WordKey,
    Word,
    WordTableColumnKey,
    WordMetaData,
    WordColumnKeys,
} from "@/services/interface";
import {
    SpreadsheetRowData,
    SpreadsheetColumnData,
    SpreadsheetService,
    SpreadsheetFieldType,
} from "@/shared/spreadsheet";
import { WordResponse } from "@/schema";
import { Counter } from "@/utils/counter";
import { numericEnumMapping } from "@/utils/enums";
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
        type: SpreadsheetFieldType.TEXT,
        label: "Spelling",
    },
    [WordTableColumnKey.Translations]: {
        key: WordTableColumnKey.Translations,
        type: SpreadsheetFieldType.TEXT,
        label: "Translations",
    },
    [WordTableColumnKey.Gender]: {
        key: WordTableColumnKey.Gender,
        type: SpreadsheetFieldType.SELECT,
        label: "Gender",
        options: GRAMMATICAL_GENDERS,
        defaultValue: String(GrammaticalGender.None),
    },
    [WordTableColumnKey.Number]: {
        key: WordTableColumnKey.Number,
        type: SpreadsheetFieldType.SELECT,
        label: "Number",
        options: GRAMMATICAL_NUMBERS,
        defaultValue: String(GrammaticalNumber.None),
    },
    [WordTableColumnKey.Person]: {
        key: WordTableColumnKey.Person,
        type: SpreadsheetFieldType.SELECT,
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
    view: IViewManager;
    info: EntityInfoEditor;
    onChange: EntityChangeHandler;
}

export class WordEditor {
    // STATE VARIABLES
    private _wordType: WordType = WordType.RootWord;
    private _modifiedWordKeys: Set<WordKey>;
    private _changed: boolean = false;

    // SERVICES
    private _view: IViewManager;
    private _info: EntityInfoEditor;
    spreadsheet: SpreadsheetService<WordColumnKeys, WordMetaData>;

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

        this._modifiedWordKeys = new Set();

        this._view = view;
        this._info = info;
        this.spreadsheet = new SpreadsheetService({
            onEditCell: (r) => this.editWord(r),
            onDeleteRow: (r) => this.deleteWord(r),
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

        const mapping: { [key: WordKey]: Word } = {};
        for (const word of words) {
            const wordRow = this._convertResponseToData(word);
            mapping[wordRow.key] = wordRow;
        }

        this._initializeSpreadsheet(Object.values(mapping));
    }

    private _initializeSpreadsheet(words: Word[]) {
        const rowData = words.map((w) => this._convertWordToRow(w));
        const colData = this._getColumnData();
        this.spreadsheet.initialize(rowData, colData);
        this._addNewWordRow();
    }

    reset() {}

    changeView(viewKey: WordViewKey) {
        const wordType = VIEW_TO_TYPE_MAPPING.get(viewKey) as WordType;
        return this._view.openWordEditor(this.languageId, wordType);
    }

    afterSync(words: Word[] | undefined | null) {
        this._changed = false;
        if (!words) return;

        for (const word of words) {
            if (!word.created && !word.updated)
                // if the backend wasn't able to commit the change,
                // then add the word back to the modified store
                this._modifiedWordKeys.add(word.key);
            else if (word.created) {
                // need to update the row with the ID that was generated by the backend
                const row = this.spreadsheet.data.findRow(word.key);
                if (!row) {
                    console.error(
                        `Unable to find row of new word '${word.key}' that was just committed to the backend.`,
                    );
                    continue;
                }

                row.metaData.id = word.id;
            }
        }
    }

    cleanUp() {
        this._modifiedWordKeys.clear();
    }

    // INDEXING

    idToKey(id: number) {
        return String(id);
    }

    convertIndexToWordKey(index: number) {
        return `N${index}`;
    }

    // MODIFIED WORDS

    claimModifiedWords() {
        const modifiedWords: Word[] = [];
        for (const key of this._modifiedWordKeys) {
            const row = this.spreadsheet.data.findRow(key);
            if (!row) {
                console.error(`Unable to find row for modified word '${key}'.`);
                continue;
            }

            modifiedWords.push(this._convertRowToWord(row));
        }
        this._modifiedWordKeys.clear();
        return modifiedWords;
    }

    // WORD EDITING

    editWord(row: SpreadsheetRowData<WordColumnKeys, WordMetaData>) {
        this._onChangeWord(row.key);
    }

    private _onChangeWord(key: WordKey) {
        if (key == this.newKey) this._addNewWordRow();
        this._modifiedWordKeys.add(key);
        this._changed = true;
        this._onChange();
    }

    // WORD CREATION

    private _addNewWordRow() {
        const newWord: Word = {
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
        this.spreadsheet.data.addRow(this._convertWordToRow(newWord));
    }

    // WORD DELETION

    deleteWord(row: SpreadsheetRowData<WordColumnKeys, WordMetaData>) {
        if (row.metaData.id !== null)
            this._view.domain.words.delete(row.metaData.id);
        this._modifiedWordKeys.delete(row.key);
    }

    // LAYOUT

    private _getColumnData(): SpreadsheetColumnData<WordColumnKeys>[] {
        const keys = this._getVisibleColumnKeys();
        const columns: SpreadsheetColumnData<WordColumnKeys>[] = [];
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

    private _convertResponseToData(word: WordResponse): Word {
        return {
            key: this.idToKey(word.id),
            ...word,
        };
    }

    private _convertWordToRow(
        word: Word,
    ): SpreadsheetRowData<WordColumnKeys, WordMetaData> {
        return {
            key: word.key,
            cells: {
                spelling: {
                    key: `${word.key}-${WordTableColumnKey.Spelling}`,
                    value: word.spelling,
                },
                translations: {
                    key: `${word.key}-${WordTableColumnKey.Translations}`,
                    value: word.translations?.join(", ") ?? "",
                },
                // NOTE: generating these labels depends on typescript's reverse mapping for numeric enums;
                // changing any of these enums to string-type or mixed-type would break this logic
                gender: {
                    key: `${word.key}-${WordTableColumnKey.Gender}`,
                    label: GrammaticalGender[word.gender],
                    value: String(word.gender),
                },
                number: {
                    key: `${word.key}-${WordTableColumnKey.Number}`,
                    label: GrammaticalNumber[word.number],
                    value: String(word.number),
                },
                person: {
                    key: `${word.key}-${WordTableColumnKey.Person}`,
                    label: GrammaticalPerson[word.person],
                    value: String(word.person),
                },
            },
            metaData: {
                id: word.id,
                created: word.created,
                updated: word.updated,
            },
        };
    }

    private _convertRowToWord(
        row: SpreadsheetRowData<WordColumnKeys, WordMetaData>,
    ): Word {
        const spelling = String(row.cells.spelling.value ?? "");

        const rawTranslations = row.cells.translations.value ?? "";
        const translations = rawTranslations.split(/,|;/).map((s) => s.trim());

        const gender = Number(row.cells.gender.value);
        const number = Number(row.cells.number.value);
        const person = Number(row.cells.person.value);

        return {
            key: row.key,
            id: row.metaData.id,
            language_id: this.languageId,
            word_type: this.wordType,
            spelling,
            translations,
            gender,
            number,
            person,
            verb_form: VerbForm.None,
            verb_tense: VerbTense.None,
        };
    }
}
