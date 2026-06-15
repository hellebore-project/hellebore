import type {
    EntryChangeEvent,
    IComponentService,
    Id,
    Word,
} from "@/interface";
import { DomainManager } from "@/api";
import { ClientData } from "@/models";
import { MultiEventProducer } from "@/utils/event-producer";

import type { EntryInfoService } from "../entry-info-service.svelte";
import { WordTableService } from "./word-table";

export interface WordEditorServiceArgs {
    info: EntryInfoService;
    domain: DomainManager;
    data: ClientData;
}

export class WordEditorService implements IComponentService {
    private _domain: DomainManager;
    private _data: ClientData;
    info: EntryInfoService;
    table: WordTableService;

    onChange: MultiEventProducer<EntryChangeEvent, unknown>;

    constructor({ info, domain, data }: WordEditorServiceArgs) {
        this._domain = domain;
        this._data = data;
        this.info = info;
        this.table = new WordTableService(
            `${this.id}-word-table`,
            domain,
            data,
        );

        this.onChange = new MultiEventProducer();

        this._linkSubscribables();
    }

    get id() {
        return `word-editor-${this.info.entryId}`;
    }

    get changed() {
        return this.table.changed;
    }

    async load(languageId: Id) {
        const projectId = this._data.loadedProjectId;

        const words = await this._domain.words.getAllForLanguage(
            projectId,
            languageId,
        );
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

    private _linkSubscribables() {
        this.table.onChange.subscribe(() =>
            this.onChange.produce({
                id: this.info.entryId,
                lexiconChanged: true,
            }),
        );
    }
}
