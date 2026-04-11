import type { JSONContent } from "@tiptap/core";

import { ARTICLE_REFERENCE_PREFIX } from "@/constants";
import type {
    ChangeEntryEvent,
    IComponentService,
    OpenEntryEditorEvent,
} from "@/interface";
import { RichTextEditorService } from "@/lib/components/rich-text-editor";
import { DomainManager } from "@/services";
import { MultiEventProducer } from "@/utils/event-producer";

import { EntryInfoService } from "../entry-info-service.svelte";
import type { EntryMentionItemData } from "./article-editor-interface";
import type { BaseMentionItemData } from "@/lib/components/rich-text-editor/mention";

export class ArticleEditorService implements IComponentService {
    private _loaded = false;

    private _domain: DomainManager;
    info: EntryInfoService;
    richText: RichTextEditorService<EntryMentionItemData>;

    onChange: MultiEventProducer<ChangeEntryEvent, unknown>;
    onSelectEntryReference: MultiEventProducer<OpenEntryEditorEvent, unknown>;

    constructor(domain: DomainManager, info: EntryInfoService) {
        this._domain = domain;
        this.info = info;
        this.richText = new RichTextEditorService({
            id: `article-rich-text-editor-${info.entryId}`,
            extensions: {
                placeholder: "Enter a description ...",
                mention: {
                    prefix: ARTICLE_REFERENCE_PREFIX,
                    querier: this._queryByTitle.bind(this),
                },
            },
        });

        this.onChange = new MultiEventProducer();
        this.onSelectEntryReference = new MultiEventProducer();

        this._createSubscriptions();
    }

    get id() {
        return `article-editor-${this.info.entryId}`;
    }

    get loaded() {
        return this._loaded;
    }

    get changed() {
        return this.richText.changed;
    }

    set changed(changed: boolean) {
        this.richText.changed = changed;
    }

    private _createSubscriptions() {
        this.richText.onChange.subscribe(() =>
            this.onChange.produce({ id: this.info.entryId }),
        );
        this.richText.onSelectMention.subscribe(({ data }) => {
            const id = data?.id;
            if (id === undefined) return;
            this.onSelectEntryReference.produce({ id });
        });
    }

    load(text: JSONContent) {
        this.richText.load(text);
        this._loaded = true;
    }

    cleanUp() {
        this.richText.cleanUp();
    }

    async _queryByTitle(
        titleFragment: string,
    ): Promise<(BaseMentionItemData & EntryMentionItemData)[]> {
        const results = await this._domain.entries.search({
            keyword: titleFragment,
            limit: 5,
        });
        if (!results) return [];

        return results
            .filter((info) => info.id != this.info.entryId)
            .map((info) => ({
                label: info.title,
                id: info.id,
            }));
    }
}
