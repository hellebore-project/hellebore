import { WordType } from "@/constants";
import type {
    ChangeEntryEvent,
    IComponentService,
    Id,
    Word,
} from "@/interface";
import { DomainManager } from "@/services";
import { MultiEventProducer } from "@/utils/event-producer";

import type { EntryInfoService } from "../entry-info-service.svelte";
import {
    ALL_WORD_TYPES,
    WORD_TYPE_SELECT_ITEMS,
    WordTableService,
} from "./word-table";
import type { WordTypeItem } from "./word-editor-interface";

export interface WordEditorServiceArgs {
    info: EntryInfoService;
    domain: DomainManager;
}

export class WordEditorService implements IComponentService {
    private _domain: DomainManager;
    private _selectedTypes: WordType[] = $state([...ALL_WORD_TYPES]);

    info: EntryInfoService;
    table: WordTableService;
    onChange: MultiEventProducer<ChangeEntryEvent, unknown>;

    constructor({ info, domain }: WordEditorServiceArgs) {
        this._domain = domain;
        this.info = info;
        this.onChange = new MultiEventProducer();
        this.table = new WordTableService(`${this.id}-word-table`, domain);
    }

    get id() {
        return `word-editor-${this.info.entryId}`;
    }

    get wordTypeItems(): WordTypeItem[] {
        return WORD_TYPE_SELECT_ITEMS;
    }

    get selectedTypeValues(): string[] {
        return this._selectedTypes.map(String);
    }

    changeFilter(values: string[]) {
        this._selectedTypes = values.map(Number) as WordType[];
        this.table.setFilter(this._selectedTypes);
    }

    async load(languageId: Id) {
        const words = await this._domain.words.getAllForLanguage(languageId);
        if (words) {
            this.table.setFilter(this._selectedTypes);
            this.table.load(words, languageId);
        }
    }

    claimModifiedWords(): Word[] {
        return this.table.claimModifiedWords();
    }

    handleSynchronization(words: Word[]) {
        this.table.handleSynchronization(words);
    }

    cleanUp() {
        this.table.cleanUp();
    }
}
