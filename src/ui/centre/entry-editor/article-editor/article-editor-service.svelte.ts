// eslint-disable-next-line
import type { JSONContent } from "@tiptap/core";

import { DomainManager } from "@/services";
import type {
    ChangeEntryEvent,
    IComponentService,
    OpenEntryEditorEvent,
} from "@/interface";
import { RichTextEditorService } from "@/lib/components/rich-text-editor";
import { MultiEventProducer } from "@/utils/event-producer";

import { EntryInfoService } from "../entry-info-service.svelte";

export class ArticleEditorService implements IComponentService {
    private _changed = false;

    private _domain: DomainManager;
    info: EntryInfoService;
    richText: RichTextEditorService;

    onChange: MultiEventProducer<ChangeEntryEvent, unknown>;
    onSelectReference: MultiEventProducer<OpenEntryEditorEvent, unknown>;

    constructor(domain: DomainManager, info: EntryInfoService) {
        this._domain = domain;
        this.info = info;
        this.richText = new RichTextEditorService();

        this.onChange = new MultiEventProducer();
        this.onSelectReference = new MultiEventProducer();
    }

    get key() {
        return `article-editor-${this.info.id}`;
    }

    get changed() {
        return this._changed;
    }

    set changed(changed: boolean) {
        this._changed = changed;
    }

    initialize(text: JSONContent) {
        this.richText.content = text ?? "";
    }

    reset() {
        this.richText.reset();
    }

    // async _queryByTitle(titleFragment: string): Promise<SuggestionData[]> {
    //     this.selectedRefIndex = 0;

    //     const results = await this._domain.entries.search({
    //         keyword: titleFragment,
    //         limit: 5,
    //     });
    //     if (!results) return [];

    //     return results
    //         .filter((info) => info.id != this.info.id)
    //         .map((info) => ({ label: info.title, value: info.id }));
    // }
}
