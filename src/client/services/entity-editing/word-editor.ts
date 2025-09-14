import { makeAutoObservable } from "mobx";

import { WordType, WordViewKey } from "@/domain/constants";
import {
    EntityChangeHandler,
    IClientManager,
    WordKey,
    Word,
    WordTableColumnKey,
    WordMetaData,
    WordColumnKeys,
} from "@/client/interface";
import {
    SpreadsheetRowData,
    SpreadsheetColumnData,
    SpreadsheetService,
    SpreadsheetFieldType,
} from "@/shared/spreadsheet";
import { WordResponse } from "@/domain/schema";
import { Counter } from "@/utils/counter";
import { EntityInfoEditor } from "./info-editor";
import { ObservableReference } from "@/shared/observable-reference";

const TYPE_TO_VIEW_MAPPING: Map<WordType, WordViewKey> = new Map([
    [WordType.RootWord, WordViewKey.RootWords],
    [WordType.Determiner, WordViewKey.Determiners],
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

const COLUMN_ORDER = [
    WordTableColumnKey.Spelling,
    WordTableColumnKey.Definition,
    WordTableColumnKey.Translations,
];
const COLUMN_DATA_MAPPING = {
    [WordTableColumnKey.Spelling]: {
        key: WordTableColumnKey.Spelling,
        type: SpreadsheetFieldType.TEXT,
        label: "Spelling",
    },
    [WordTableColumnKey.Definition]: {
        key: WordTableColumnKey.Definition,
        type: SpreadsheetFieldType.TEXT,
        label: "Definition",
    },
    [WordTableColumnKey.Translations]: {
        key: WordTableColumnKey.Translations,
        type: SpreadsheetFieldType.TEXT,
        label: "Translations",
    },
};

type PrivateKeys =
    | "_columnData"
    | "_modifiedWordKeys"
    | "_wordKeyGenerator"
    | "_onChange"
    | "_view"
    | "_info";

interface WordEditorArguments {
    view: IClientManager;
    info: EntityInfoEditor;
    editableCellRef: ObservableReference<HTMLInputElement>;
    onChange: EntityChangeHandler;
}

export class WordEditor {
    // STATE VARIABLES
    private _wordType: WordType = WordType.RootWord;
    private _modifiedWordKeys: Set<WordKey>;
    private _changed: boolean = false;

    // SERVICES
    private _view: IClientManager;
    private _info: EntityInfoEditor;
    spreadsheet: SpreadsheetService<WordColumnKeys, WordMetaData>;

    // UTILITIES
    private _wordKeyGenerator: Counter;

    // CALLBACKS
    private _onChange: EntityChangeHandler;

    // CONSTRUCTION
    constructor({
        view,
        info,
        editableCellRef,
        onChange,
    }: WordEditorArguments) {
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
            data: {
                editableCellRef,
                onEditCell: (r) => this.editWord(r),
                onDeleteRow: (r) => this.deleteWord(r),
            },
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
            definition: "",
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
            case WordType.RootWord:
                return new Set([
                    WordTableColumnKey.Spelling,
                    WordTableColumnKey.Definition,
                ]);
            default:
                return new Set([
                    WordTableColumnKey.Spelling,
                    WordTableColumnKey.Definition,
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
                definition: {
                    key: `${word.key}-${WordTableColumnKey.Definition}`,
                    value: word.definition,
                },
                translations: {
                    key: `${word.key}-${WordTableColumnKey.Translations}`,
                    value: word.translations?.join(", ") ?? "",
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

        const definition = String(row.cells.definition.value ?? "");

        const rawTranslations = row.cells.translations.value ?? "";
        const translations = rawTranslations.split(/,|;/).map((s) => s.trim());

        return {
            key: row.key,
            id: row.metaData.id,
            language_id: this.languageId,
            word_type: this.wordType,
            spelling,
            definition,
            translations,
        };
    }
}
