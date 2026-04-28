import {
    CentralViewType,
    ENTRY_VIEW_LABELS,
    EntryType,
    EntryViewType,
} from "@/constants";
import type {
    ChangeEntryEvent,
    DeleteEntryEvent,
    EntryEditorInfo,
    ICentralPanelContentService,
    Id,
    OpenEntryEditorEvent,
    PollEvent,
    PollResultEntryData,
    SyncEntryEvent,
    Word,
} from "@/interface";
import { DomainManager } from "@/services";
import { MultiEventProducer } from "@/utils/event-producer";

import { EntryInfoService } from "./entry-info-service.svelte";
import { ArticleEditorService } from "./article-editor";
import { PropertyEditorService } from "./property-editor";
import { WordEditorService } from "./word-editor";

export class EntryEditorService implements ICentralPanelContentService {
    // CONSTANTS
    ENTRY_HEADER_SPACE_HEIGHT = 25;
    DEFAULT_BELOW_HEADER_SPACE_HEIGHT = 40;
    TITLE_FIELD_HEIGHT = 36;

    // STATE
    private _viewKey: EntryViewType = $state(EntryViewType.ArticleEditor);

    // SERVICES
    private _domain: DomainManager;
    info: EntryInfoService;
    properties: PropertyEditorService;
    article: ArticleEditorService;
    lexicon: WordEditorService;

    // EVENTS
    onOpenReferencedEntry: MultiEventProducer<OpenEntryEditorEvent, unknown>;
    onChange: MultiEventProducer<ChangeEntryEvent, unknown>;
    onPartialChange: MultiEventProducer<ChangeEntryEvent, unknown>;
    onPeriodicChange: MultiEventProducer<ChangeEntryEvent, unknown>;
    onDelete: MultiEventProducer<DeleteEntryEvent, unknown>;

    constructor(entryId: Id, domain: DomainManager) {
        this._domain = domain;

        this.info = new EntryInfoService(entryId);
        this.article = new ArticleEditorService(domain, this.info);
        this.properties = new PropertyEditorService({
            info: this.info,
        });
        this.lexicon = new WordEditorService({
            domain,
            info: this.info,
        });

        this.onOpenReferencedEntry = new MultiEventProducer();
        this.onChange = new MultiEventProducer();
        this.onPartialChange = new MultiEventProducer();
        this.onPeriodicChange = new MultiEventProducer();
        this.onDelete = new MultiEventProducer();

        this._createSubscriptions();
    }

    get id() {
        return EntryEditorService.generateKey(this.type, this.info.entryId);
    }

    get type() {
        return CentralViewType.EntryEditor;
    }

    get details() {
        return {
            id: this.id,
            type: this.type,
            subType: this.currentView,
            entry: {
                id: this.info.entryId,
                type: this.info.entryType,
                title: this.info.title,
            },
        } as EntryEditorInfo;
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

    get currentViewLabel() {
        return ENTRY_VIEW_LABELS[this._viewKey];
    }

    // INITIALIZATION

    private _createSubscriptions() {
        this.info.onChangeTitle.broker = this.onPartialChange;

        this.article.onChange.broker = this.onPeriodicChange;
        this.article.onSelectEntryReference.broker = this.onOpenReferencedEntry;

        this.properties.onChange.broker = this.onPeriodicChange;

        this.lexicon.onChange.broker = this.onPeriodicChange;
    }

    // LOADING

    async load({
        id,
        viewKey = EntryViewType.ArticleEditor,
    }: OpenEntryEditorEvent) {
        if (viewKey == EntryViewType.ArticleEditor) return this.loadArticle(id);
        else if (viewKey == EntryViewType.PropertyEditor)
            return this.loadProperties(id);
        else if (viewKey == EntryViewType.WordEditor)
            return this.loadLexicon(id);
        throw `Unable to load view with key ${viewKey}.`;
    }

    async loadArticle(id: Id) {
        if (this.isArticleEditorOpen && this.article.loaded) return; // the article is already open

        const response = await this._domain.entries.getArticle(id);
        if (response) {
            this.currentView = EntryViewType.ArticleEditor;
            this.info.load(id, response.info.entityType, response.info.title);
            this.article.load(response.text);
        }
    }

    async loadProperties(id: Id) {
        if (this.isPropertyEditorOpen) return; // the property editor is already open

        const response = await this._domain.entries.getProperties(id);

        if (response !== null) {
            this.currentView = EntryViewType.PropertyEditor;
            this.info.load(id, response.info.entityType, response.info.title);
            this.properties.load(response.properties);
        }
    }

    async loadLexicon(languageId: Id) {
        if (this.isWordEditorOpen) return;

        const info = await this._domain.entries.get(languageId);

        if (info !== null) {
            this.currentView = EntryViewType.WordEditor;
            this.info.load(languageId, EntryType.Language, info.title);
            await this.lexicon.load(languageId);
        }
    }

    changeView(viewType: EntryViewType) {
        // the entry-editor is switching to a different view,
        // so any pending edits need to be pushed to the BE
        this.onChange.produce({ id: this.info.entryId });
        this.load({
            id: this.info.entryId,
            viewKey: viewType,
        });
    }

    // VISIBILITY

    activate() {
        return;
    }

    // CLEAN UP

    cleanUp() {
        this.onChange.produce({ id: this.info.entryId });
        this.article.cleanUp();
        this.properties.changed = false;
        this.lexicon.cleanUp();

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
        syncProperties = false,
        syncText = false,
        syncLexicon = false,
    }: PollEvent): PollResultEntryData | null {
        if (this.info.entryId === null || this.info.entryType === null)
            return null;

        if (id !== null && this.info.entryId !== id) return null;

        const entry: PollResultEntryData = {
            id: this.info.entryId,
            entryType: this.info.entryType,
        };

        if (syncTitle && this.info.titleChanged && this.info.isTitleValid)
            entry.title = this.info.title;

        if (syncProperties && this.properties.changed) {
            const properties = this.properties.entity;
            if (properties) entry.properties = properties;
        }

        if (syncText && this.article.changed)
            entry.text = this.article.richText.serialized;

        if (syncLexicon) {
            const words = this.lexicon.claimModifiedWords();
            if (words.length > 0) entry.words = words;
        }

        return entry;
    }

    handleSynchronization(events: SyncEntryEvent[]) {
        for (const { request, response } of events) {
            if (this.info.entryId != request.id) return;

            if (response.entry) {
                this.info.isTitleUnique = response.entry.title.isUnique ?? true;
                if (response.entry.title.updated && request?.title)
                    this.info.handleSynchronization(request.title);

                if (response.entry.properties.updated)
                    this.properties.changed = false;

                if (response.entry.text.updated) this.article.changed = false;

                if (request.words && response.entry) {
                    const wordResponses = response.entry.words;
                    const words: Word[] = request.words.map((word, i) => {
                        const wordResponse = wordResponses[i];
                        return {
                            ...word,
                            id: wordResponse.id,
                            created: wordResponse.status.created,
                            updated: wordResponse.status.updated,
                        };
                    });
                    this.lexicon.handleSynchronization(words);
                }
            }
        }
    }

    // DELETION

    deleteEntry() {
        this.onDelete.produce({
            id: this.info.entryId,
            title: this.info.title,
        });
    }

    // UTILITY

    static generateKey(type: CentralViewType, entryId: Id) {
        return `${type}_${entryId}`;
    }
}
