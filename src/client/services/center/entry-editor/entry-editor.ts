import { makeAutoObservable } from "mobx";

import { Id } from "@/interface";
import { EntryViewType, CentralViewType } from "@/client/constants";
import {
    ChangeEntryEvent,
    ICentralPanelContentManager,
    OpenEntryEditorEvent,
    PollEvent,
    PollResultEntryData,
    SyncEntryEvent,
    Word,
} from "@/client/interface";
import { DomainManager, EntityType, WordType } from "@/domain";
import { TableOfContentsItemData } from "@/shared/table-of-contents";
import { EventProducer } from "@/utils/event";

import { WordEditor, WordEditorArguments } from "./word-editor";
import { EntryInfoEditor } from "./info-editor";
import { ArticleEditor } from "./article-editor";
import { PropertyEditor } from "./property-editor";

type PrivateKeys = "_domain";

export interface EntryEditorArguments {
    domain: DomainManager;
    wordEditor: Omit<WordEditorArguments, "domain" | "info">;
}

interface OpenArticleEditorArguments {
    id: Id;
    entityType?: EntityType;
    title?: string;
    text?: string;
}

export class EntryEditor implements ICentralPanelContentManager {
    // CONSTANTS
    ENTRY_HEADER_SPACE_HEIGHT = 25;
    DEFAULT_BELOW_HEADER_SPACE_HEIGHT = 40;
    TITLE_FIELD_HEIGHT = 36;

    // STATE
    tabData: Map<EntryViewType, TableOfContentsItemData>;
    private _viewKey: EntryViewType = EntryViewType.ArticleEditor;

    // SERVICES
    private _domain: DomainManager;
    info: EntryInfoEditor;
    properties: PropertyEditor;
    article: ArticleEditor;
    lexicon: WordEditor;

    // EVENTS
    onOpen: EventProducer<OpenEntryEditorEvent, void>;
    onCleanUp: EventProducer<EntryViewType, void>;
    onChange: EventProducer<ChangeEntryEvent, unknown>;
    onPartialChange: EventProducer<ChangeEntryEvent, unknown>;
    onChangeDelayed: EventProducer<ChangeEntryEvent, unknown>;

    constructor({ domain, wordEditor }: EntryEditorArguments) {
        this.tabData = new Map();

        this._domain = domain;

        this.info = new EntryInfoEditor();
        this.article = new ArticleEditor({
            domain,
            info: this.info,
        });
        this.properties = new PropertyEditor({
            info: this.info,
        });
        this.lexicon = new WordEditor({
            domain,
            info: this.info,
            ...wordEditor,
        });

        this.onOpen = new EventProducer();
        this.onCleanUp = new EventProducer();
        this.onChange = new EventProducer();
        this.onPartialChange = new EventProducer();
        this.onChangeDelayed = new EventProducer();

        makeAutoObservable<EntryEditor, PrivateKeys>(this, {
            _domain: false,
            info: false,
            properties: false,
            article: false,
            lexicon: false,
            onOpen: false,
            onCleanUp: false,
            onChange: false,
            onPartialChange: false,
            onChangeDelayed: false,
        });

        this._buildTabData();
        this._linkSubscribables();
    }

    get key() {
        return EntryEditor.generateKey(this.type, this.info.id);
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
        if (this._viewKey == EntryViewType.WordEditor) this.lexicon.reset();
        this._viewKey = key;
    }

    get entryType() {
        return this.info.entityType;
    }

    // INITIALIZATION

    private _buildTabData() {
        this.tabData.set(EntryViewType.ArticleEditor, {
            label: "Article",
            value: EntryViewType.ArticleEditor,
            rank: 1,
            onClick: () => {
                this.changeView(EntryViewType.ArticleEditor);
            },
        });

        this.tabData.set(EntryViewType.PropertyEditor, {
            label: "Properties",
            value: EntryViewType.PropertyEditor,
            rank: 1,
            onClick: () => {
                this.changeView(EntryViewType.PropertyEditor);
            },
        });

        this.tabData.set(EntryViewType.WordEditor, {
            label: "Lexicon",
            value: EntryViewType.WordEditor,
            rank: 1,
            onClick: () => {
                this.changeView(EntryViewType.WordEditor);
            },
        });
    }

    private _linkSubscribables() {
        this.article.onSelectReference.subscribe((id) =>
            this.loadArticle({ id }),
        );

        this.lexicon.onChangeWordType.subscribe(({ languageId, wordType }) => {
            // the word-editor is switching to a different view,
            // so any pending edits need to be pushed to the BE
            this.onChange.produce({ id: languageId });
            this.loadLexicon(languageId, wordType);
        });

        this.info.onChangeTitle.broker = this.onPartialChange;
        this.article.onChange.broker = this.onChangeDelayed;
        this.properties.onChange.broker = this.onChangeDelayed;
        this.lexicon.onChange.broker = this.onChangeDelayed;
    }

    // LOADING

    async load({
        id,
        viewKey = EntryViewType.ArticleEditor,
        wordType,
    }: OpenEntryEditorEvent) {
        if (viewKey == EntryViewType.ArticleEditor)
            return this.loadArticle({ id });
        else if (viewKey == EntryViewType.PropertyEditor)
            return this.loadProperties(id);
        else if (viewKey == EntryViewType.WordEditor)
            return this.loadLexicon(id, wordType);
        throw `Unable to load view with key ${viewKey}.`;
    }

    async loadArticle({
        id,
        entityType,
        title,
        text,
    }: OpenArticleEditorArguments) {
        if (this.isArticleEditorOpen && this.info.id == id) return; // the article is already open

        if (!entityType || title === undefined || text === undefined) {
            const response = await this._domain.entries.getArticle(id);
            if (response) {
                entityType = response.info.entity_type;
                title = response.info.title;
                text = response.text;
            }
        }

        if (entityType && title !== undefined && text !== undefined) {
            this.currentView = EntryViewType.ArticleEditor;
            this.info.load(id, entityType, title);
            this.article.initialize(text);
            this.onOpen.produce({ id, viewKey: this.currentView });
        }
    }

    async loadProperties(id: Id) {
        if (this.isPropertyEditorOpen && this.info.id == id) return; // the property editor is already open

        const response = await this._domain.entries.getProperties(id);

        if (response !== null) {
            this.currentView = EntryViewType.PropertyEditor;
            this.info.load(id, response.info.entity_type, response.info.title);
            this.properties.initialize(response.properties);
            this.onOpen.produce({ id, viewKey: this.currentView });
        }
    }

    async loadLexicon(languageId: Id, wordType?: WordType) {
        if (this.isWordEditorOpen && this.info.id == languageId) {
            if (wordType === undefined)
                // don't care about which word type is displayed;
                // since the word editor is already open for this language, don't reload it
                return;
            else if (wordType === this.lexicon.wordType)
                // the word editor is already open for this language and word type
                return;
        }

        const info = await this._domain.entries.get(languageId);

        if (info !== null) {
            this.currentView = EntryViewType.WordEditor;
            this.info.load(languageId, EntityType.LANGUAGE, info.title);
            this.onOpen.produce({
                id: languageId,
                viewKey: this.currentView,
                wordType,
            });
            // FIXME: should we be awaiting on this?
            this.lexicon.load(languageId, wordType);
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
        // Every time the entry-editor is activated (e.g., becomes visible),
        // the spreadsheet service needs to be rehooked onto the reference. That's because
        // multiple spreadsheet services can share the same spreadsheet reference,
        // but only a single one of them can be hooked to it at a single time.
        this.lexicon.spreadsheet.hookToReference();
    }

    // CLEAN UP

    cleanUp() {
        this.onChange.produce({ id: this.info.id });
        this.onCleanUp.produce(this.currentView);
        this.lexicon.cleanUp();

        this.onOpen.broker = null;
        this.onCleanUp.broker = null;
        this.onChange.broker = null;
        this.onPartialChange.broker = null;
        this.onChangeDelayed.broker = null;
    }

    // SYNC

    fetchChanges({
        syncTitle = false,
        syncProperties = false,
        syncText = false,
        syncLexicon = false,
    }: PollEvent): PollResultEntryData | null {
        if (this.info.id === null || this.info.entityType === null) return null;

        const entry: PollResultEntryData = {
            id: this.info.id,
            entityType: this.info.entityType,
        };

        if (syncTitle && this.info.titleChanged && this.info.isTitleValid)
            entry.title = this.info.title;

        if (syncProperties && this.properties.changed) {
            const properties = this.properties.data;
            if (properties) entry.properties = properties;
        }

        if (syncText && this.article.changed)
            entry.text = this.article.serialized;

        if (syncLexicon) {
            const words = this.lexicon.claimModifiedWords();
            if (words.length > 0) entry.words = words;
        }

        return entry;
    }

    handleSynchronization({ request, response }: SyncEntryEvent) {
        if (this.info.id != request.id) return;

        if (response.title && response.title.updated) {
            this.info.isTitleUnique = response.title.isUnique ?? true;
            this.info.titleChanged = false;
        }

        if (response.properties && response.properties.updated)
            this.properties.changed = false;

        if (response.text && response.text.updated)
            this.article.changed = false;

        if (request.words && response.lexicon) {
            const wordResponses = response.lexicon;

            const words: Word[] = request.words.map((word, i) => {
                const wordResponse = wordResponses[i];
                return {
                    ...word,
                    id: wordResponse.id,
                    created: wordResponse.created,
                    updated: wordResponse.updated,
                };
            });

            this.lexicon.afterSync(words);
        }
    }

    // UTILITY

    static generateKey(type: CentralViewType, entryId: Id) {
        return `${type}_${entryId}`;
    }
}
