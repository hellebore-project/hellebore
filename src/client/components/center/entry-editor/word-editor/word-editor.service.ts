import { makeAutoObservable } from "mobx";

import { WordViewType } from "@/client/constants";
import {
    WordKey,
    Word,
    WordMetaData,
    ChangeEntryEvent,
} from "@/client/interface";
import { DomainManager, WordResponse, WordType } from "@/domain";
import { Id } from "@/interface";
import {
    SpreadsheetRowData,
    SpreadsheetColumnData,
    SpreadsheetService,
    SpreadsheetFieldType,
    SpreadsheetServiceArgs,
} from "@/shared/spreadsheet";
import { Counter } from "@/utils/counter";
import { EventProducer } from "@/utils/event";

import { EntryInfoService } from "../entry-info.service";

export type WordColumnKeys = "spelling" | "definition" | "translations";

enum WordTableColumnKey {
    Spelling = "spelling",
    Definition = "definition",
    Translations = "translations",
}

const TYPE_TO_VIEW_MAPPING = new Map<WordType, WordViewType>([
    [WordType.RootWord, WordViewType.RootWords],
    [WordType.Determiner, WordViewType.Determiners],
    [WordType.Preposition, WordViewType.Prepositions],
    [WordType.Conjunction, WordViewType.Conjunctions],
    [WordType.Pronoun, WordViewType.Pronouns],
    [WordType.Noun, WordViewType.Nouns],
    [WordType.Adjective, WordViewType.Adjectives],
    [WordType.Adverb, WordViewType.Adverbs],
    [WordType.Verb, WordViewType.Verbs],
]);
const VIEW_TO_TYPE_MAPPING = new Map<WordViewType, WordType>(
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
    | "_domain";

export interface WordEditorServiceArgs {
    domain: DomainManager;
    info: EntryInfoService;
    spreadsheet: Omit<
        SpreadsheetServiceArgs<WordColumnKeys, WordMetaData>,
        "data"
    >;
}

interface ChangeWordTypeEvent {
    languageId: Id;
    wordType: WordType;
}

export class WordEditorService {
    // STATE VARIABLES
    private _wordType: WordType = WordType.RootWord;
    private _modifiedWordKeys: Set<WordKey>;
    private _changed = false;

    // SERVICES
    private _domain: DomainManager;
    info: EntryInfoService;
    spreadsheet: SpreadsheetService<WordColumnKeys, WordMetaData>;

    // UTILITIES
    private _wordKeyGenerator: Counter;

    // EVENTS
    fetchPortalSelector: EventProducer<void, string>;
    onChange: EventProducer<ChangeEntryEvent, unknown>;
    onChangeWordType: EventProducer<ChangeWordTypeEvent, void>;

    // CONSTRUCTION
    constructor({ domain, info, spreadsheet }: WordEditorServiceArgs) {
        this._modifiedWordKeys = new Set();
        this._wordKeyGenerator = new Counter();

        this.fetchPortalSelector = new EventProducer();
        this.onChange = new EventProducer();
        this.onChangeWordType = new EventProducer();

        this._domain = domain;
        this.info = info;
        this.spreadsheet = new SpreadsheetService({
            data: {
                onEditCell: (r) => this.editWord(r),
                onDeleteRow: (r) => this.deleteWord(r),
            },
            ...spreadsheet,
        });

        makeAutoObservable<WordEditorService, PrivateKeys>(this, {
            _modifiedWordKeys: false,
            _columnData: false,
            _wordKeyGenerator: false,
            _domain: false,
            info: false,
            spreadsheet: false,
            fetchPortalSelector: false,
            onChange: false,
            onChangeWordType: false,
        });
    }

    // PROPERTIES

    get languageId() {
        return this.info.id;
    }

    get wordType() {
        return this._wordType;
    }

    get viewKey(): WordViewType {
        if (this._wordType == WordType.None) return WordViewType.RootWords;
        return TYPE_TO_VIEW_MAPPING.get(this._wordType) as WordViewType;
    }

    get newKey() {
        return this.convertIndexToWordKey(this._wordKeyGenerator.index);
    }

    get changed() {
        return this._changed;
    }

    // LOADING

    async load(languageId: number, wordType: WordType = WordType.RootWord) {
        if (wordType !== undefined) this._wordType = wordType;
        return this._domain.words
            .getAllForLanguage(languageId, wordType)
            .then((words) => this._setWords(words));
    }

    private _setWords(words: WordResponse[] | null) {
        if (!words) words = [];

        const mapping: Record<WordKey, Word> = {};
        for (const word of words) {
            const wordRow = this._convertResponseToData(word);
            mapping[wordRow.key] = wordRow;
        }

        this._initializeSpreadsheet(Object.values(mapping));
    }

    private _initializeSpreadsheet(words: Word[]) {
        const rowData = words.map((w) => this._convertWordToRow(w));
        const colData = this._getColumnData();
        this.spreadsheet.load(rowData, colData);
        this._addNewWordRow();
    }

    // INDEXING

    idToKey(id: number) {
        return String(id);
    }

    convertIndexToWordKey(index: number) {
        return `N${index}`;
    }

    // WORD FILTERING

    changeView(viewKey: WordViewType) {
        const wordType = VIEW_TO_TYPE_MAPPING.get(viewKey) as WordType;
        this.onChangeWordType.produce({
            languageId: this.languageId,
            wordType,
        });
    }

    // WORD EDITING

    editWord(row: SpreadsheetRowData<WordColumnKeys, WordMetaData>) {
        this._onChangeWord(row.key);
    }

    private _onChangeWord(key: WordKey) {
        if (key == this.newKey) this._addNewWordRow();
        this._modifiedWordKeys.add(key);
        this._changed = true;
        this.onChange.produce({ id: this.info.id });
    }

    // WORD CREATION

    private _addNewWordRow() {
        const newWord: Word = {
            key: this.convertIndexToWordKey(this._wordKeyGenerator.increment()),
            id: null,
            languageId: this.languageId,
            wordType: this.wordType as WordType,
            spelling: "",
            definition: "",
            translations: [],
        };
        this.spreadsheet.data.addRow(this._convertWordToRow(newWord));
    }

    // WORD DELETION

    deleteWord(row: SpreadsheetRowData<WordColumnKeys, WordMetaData>) {
        if (row.metaData.id !== null)
            this._domain.words.delete(row.metaData.id);
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

    // SYNC

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

    handleSynchronization(words: Word[] | undefined | null) {
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

    // CLEAN UP

    cleanUp() {
        this._modifiedWordKeys.clear();
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
            languageId: this.languageId,
            wordType: this.wordType,
            spelling,
            definition,
            translations,
        };
    }
}
