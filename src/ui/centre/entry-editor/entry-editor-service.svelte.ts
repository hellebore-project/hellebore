import { SvelteMap } from "svelte/reactivity";

import {
    CentralViewType,
    EntryType,
    EntryViewType,
    WordType,
} from "@/constants";
import type {
    ChangeEntryEvent,
    DeleteEntryEvent,
    ICentralPanelContentService,
    Id,
    OpenEntryEditorEvent,
    PollEvent,
    PollResultEntryData,
    SyncEntryEvent,
    // Word,
} from "@/interface";
import { DomainManager } from "@/services";
import type { VerticalTabsItemData } from "@/lib/components/vertical-tabs";
import { MultiEventProducer } from "@/utils/event-producer";

import { EntryInfoService } from "./entry-info-service.svelte";
import { ArticleEditorService } from "./article-editor";
// import { PropertyEditorService } from "./property-editor";
// import { WordEditorService, WordEditorServiceArgs } from "./word-editor";

export class EntryEditorService implements ICentralPanelContentService {
    // CONSTANTS
    ENTRY_HEADER_SPACE_HEIGHT = 25;
    DEFAULT_BELOW_HEADER_SPACE_HEIGHT = 40;
    TITLE_FIELD_HEIGHT = 36;

    // STATE
    private _tabData: Map<EntryViewType, VerticalTabsItemData> = $state(
        new SvelteMap(),
    );
    private _viewKey: EntryViewType = $state(EntryViewType.ArticleEditor);

    // SERVICES
    private _domain: DomainManager;
    info: EntryInfoService;
    // properties: PropertyEditorService;
    article: ArticleEditorService;
    // lexicon: WordEditorService;

    // EVENTS
    onOpenReferencedEntry: MultiEventProducer<OpenEntryEditorEvent, unknown>;
    onChange: MultiEventProducer<ChangeEntryEvent, unknown>;
    onPartialChange: MultiEventProducer<ChangeEntryEvent, unknown>;
    onPeriodicChange: MultiEventProducer<ChangeEntryEvent, unknown>;
    onDelete: MultiEventProducer<DeleteEntryEvent, unknown>;

    constructor(domain: DomainManager) {
        this._domain = domain;

        this.info = new EntryInfoService();
        this.article = new ArticleEditorService(domain, this.info);
        // this.properties = new PropertyEditorService({
        //     info: this.info,
        // });
        // this.lexicon = new WordEditorService({
        //     domain,
        //     info: this.info,
        //     ...wordEditor,
        // });

        this.onOpenReferencedEntry = new MultiEventProducer();
        this.onChange = new MultiEventProducer();
        this.onPartialChange = new MultiEventProducer();
        this.onPeriodicChange = new MultiEventProducer();
        this.onDelete = new MultiEventProducer();

        this._buildTabData();
        this._linkSubscribables();
    }

    get key() {
        return EntryEditorService.generateKey(this.type, this.info.id);
    }

    get type() {
        return CentralViewType.EntryEditor;
    }

    get details() {
        return {
            type: this.type,
            entry: { id: this.info.id },
        };
    }

    get headerSpaceHeight() {
        return this.ENTRY_HEADER_SPACE_HEIGHT;
    }

    get belowHeaderSpaceHeight() {
        return this.DEFAULT_BELOW_HEADER_SPACE_HEIGHT;
    }

    get isArticleEditorOpen() {
        return this.currentView == EntryViewType.ArticleEditor;
    }

    get isPropertyEditorOpen() {
        return this.currentView == EntryViewType.PropertyEditor;
    }

    get isWordEditorOpen() {
        return this.currentView == EntryViewType.WordEditor;
    }

    get currentView() {
        return this._viewKey;
    }

    set currentView(key: EntryViewType) {
        if (this._viewKey == key) return;
        this._viewKey = key;
    }

    get tabData() {
        const entryType = this.info.entryType;

        const tabData: VerticalTabsItemData[] = [
            this._tabData.get(
                EntryViewType.ArticleEditor,
            ) as VerticalTabsItemData,
            this._tabData.get(
                EntryViewType.PropertyEditor,
            ) as VerticalTabsItemData,
        ];
        if (entryType === EntryType.Language)
            tabData.push(
                this._tabData.get(
                    EntryViewType.WordEditor,
                ) as VerticalTabsItemData,
            );

        return tabData;
    }

    // INITIALIZATION

    private _buildTabData() {
        this._tabData.set(EntryViewType.ArticleEditor, {
            label: "Article",
            value: EntryViewType.ArticleEditor,
        });

        this._tabData.set(EntryViewType.PropertyEditor, {
            label: "Properties",
            value: EntryViewType.PropertyEditor,
        });

        this._tabData.set(EntryViewType.WordEditor, {
            label: "Lexicon",
            value: EntryViewType.WordEditor,
        });
    }

    private _linkSubscribables() {
        this.info.onChangeTitle.broker = this.onPartialChange;

        this.article.onChange.broker = this.onPeriodicChange;
        this.article.onSelectReference.broker = this.onOpenReferencedEntry;

        // this.properties.onChange.broker = this.onPeriodicChange;

        // this.lexicon.fetchPortalSelector.broker = this.fetchPortalSelector;
        // this.lexicon.onChangeWordType.subscribe(({ languageId, wordType }) => {
        //     // the word-editor is switching to a different view,
        //     // so any pending edits need to be pushed to the BE
        //     this.onChange.produce({ id: languageId });
        //     this.loadLexicon(languageId, wordType);
        // });
        // this.lexicon.onChange.broker = this.onPeriodicChange;
    }

    // LOADING

    async load({
        id,
        viewKey = EntryViewType.ArticleEditor,
        wordType,
    }: OpenEntryEditorEvent) {
        if (viewKey == EntryViewType.ArticleEditor) return this.loadArticle(id);
        else if (viewKey == EntryViewType.PropertyEditor)
            return this.loadProperties(id);
        else if (viewKey == EntryViewType.WordEditor)
            return this.loadLexicon(id, wordType);
        throw `Unable to load view with key ${viewKey}.`;
    }

    async loadArticle(id: Id) {
        if (this.isArticleEditorOpen && this.info.id == id) return; // the article is already open

        const response = await this._domain.entries.getArticle(id);
        if (response) {
            this.currentView = EntryViewType.ArticleEditor;
            this.info.load(id, response.info.entityType, response.info.title);
            // this.article.initialize(response.text);
        }
    }

    async loadProperties(id: Id) {
        if (this.isPropertyEditorOpen && this.info.id == id) return; // the property editor is already open

        const response = await this._domain.entries.getProperties(id);

        if (response !== null) {
            this.currentView = EntryViewType.PropertyEditor;
            this.info.load(id, response.info.entityType, response.info.title);
            // this.properties.load(response.properties);
        }
    }

    async loadLexicon(languageId: Id, wordType?: WordType) {
        if (this.isWordEditorOpen && this.info.id == languageId) {
            if (wordType === undefined)
                // don't care about which word type is displayed;
                // since the word editor is already open for this language, don't reload it
                return;
            // else if (wordType === this.lexicon.wordType)
            //     // the word editor is already open for this language and word type
            //     return;
        }

        const info = await this._domain.entries.get(languageId);

        if (info !== null) {
            this.currentView = EntryViewType.WordEditor;
            this.info.load(languageId, EntryType.Language, info.title);
            // FIXME: should we be awaiting on this?
            // this.lexicon.load(languageId, wordType);
        }
    }

    changeView(viewType: EntryViewType) {
        // the entry-editor is switching to a different view,
        // so any pending edits need to be pushed to the BE
        this.onChange.produce({ id: this.info.id });
        this.load({
            id: this.info.id,
            viewKey: viewType,
        });
    }

    // VISIBILITY

    activate() {
        // no-op
    }

    // CLEAN UP

    cleanUp() {
        this.onChange.produce({ id: this.info.id });
        // this.lexicon.cleanUp();

        this.onOpenReferencedEntry.broker = null;
        this.onChange.broker = null;
        this.onPartialChange.broker = null;
        this.onPeriodicChange.broker = null;
        this.onDelete.broker = null;
    }

    // SYNC

    fetchChanges({
        id = null,
        syncTitle = false,
        // syncProperties = false,
        // syncText = false,
        // syncLexicon = false,
    }: PollEvent): PollResultEntryData | null {
        if (this.info.id === null || this.info.entryType === null) return null;

        if (id !== null && this.info.id !== id) return null;

        const entry: PollResultEntryData = {
            id: this.info.id,
            entryType: this.info.entryType,
        };

        if (syncTitle && this.info.titleChanged && this.info.isTitleValid)
            entry.title = this.info.title;

        // if (syncProperties && this.properties.changed) {
        //     const properties = this.properties.data;
        //     if (properties) entry.properties = properties;
        // }

        // if (syncText && this.article.changed)
        //     entry.text = this.article.serialized;

        // if (syncLexicon) {
        //     const words = this.lexicon.claimModifiedWords();
        //     if (words.length > 0) entry.words = words;
        // }

        return entry;
    }

    handleSynchronization(events: SyncEntryEvent[]) {
        for (const { request, response } of events) {
            if (this.info.id != request.id) return;

            if (response.entry) {
                this.info.isTitleUnique = response.entry.title.isUnique ?? true;
                if (response.entry.title.updated)
                    this.info.titleChanged = false;

                // if (response.entry.properties.updated)
                //     this.properties.changed = false;

                if (response.entry.text.updated) this.article.changed = false;

                if (request.words) {
                    // const wordResponses = response.entry.words;
                    // const words: Word[] = request.words.map((word, i) => {
                    //     const wordResponse = wordResponses[i];
                    //     return {
                    //         ...word,
                    //         id: wordResponse.id,
                    //         created: wordResponse.status.created,
                    //         updated: wordResponse.status.updated,
                    //     };
                    // });
                    // this.lexicon.handleSynchronization(words);
                }
            }
        }
    }

    // DELETION

    deleteEntry() {
        this.onDelete.produce({ id: this.info.id, title: this.info.title });
    }

    // UTILITY

    static generateKey(type: CentralViewType, entryId: Id) {
        return `${type}_${entryId}`;
    }
}
