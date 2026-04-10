import type {
    ChangeEntryEvent,
    IComponentService,
    Id,
    Word,
} from "@/interface";
import { DomainManager } from "@/services";
import { MultiEventProducer } from "@/utils/event-producer";

import type { EntryInfoService } from "../entry-info-service.svelte";
import { WordTableService } from "./word-table";

export interface WordEditorServiceArgs {
    info: EntryInfoService;
    domain: DomainManager;
}

export class WordEditorService implements IComponentService {
    private _domain: DomainManager;

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

    async load(languageId: Id) {
        const words = await this._domain.words.getAllForLanguage(languageId);
        if (words) {
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
