import { makeAutoObservable } from "mobx";

import { Id } from "@/interface";
import { EntryViewKey, ViewKey } from "@/client/constants";
import {
    IViewManager,
    PollEvent,
    PollResultEntryData,
    PropertyFieldData,
    SyncEntryEvent,
    Word,
} from "@/client/interface";
import { Synchronizer } from "@/client/services/synchronizer";
import { BaseEntity, DomainManager, EntityType, WordType } from "@/domain";
import { ObservableReference } from "@/shared/observable-reference";
import { EventProducer } from "@/utils/event";

import { WordEditor } from "./word-editor";
import { EntryInfoEditor } from "./info-editor";
import { ArticleEditor } from "./article-editor";
import { PropertyEditor } from "./property-editor";

type PrivateKeys = "_domain" | "_synchronizer";

export interface EntryEditorArguments {
    domain: DomainManager;
    synchronizer: Synchronizer;
    wordEditor: {
        editableCellRef: ObservableReference<HTMLInputElement>;
    };
}

interface OpenArticleEditorArguments {
    id: Id;
    entityType?: EntityType;
    title?: string;
    text?: string;
}

export class EntryEditor implements IViewManager {
    // CONSTANTS
    ENTRY_HEADER_SPACE_HEIGHT = 25;
    DEFAULT_BELOW_HEADER_SPACE_HEIGHT = 40;
    TITLE_FIELD_HEIGHT = 36;

    // STATE
    private _viewKey: EntryViewKey = EntryViewKey.ArticleEditor;

    // SERVICES
    private _domain: DomainManager;
    private _synchronizer: Synchronizer;
    info: EntryInfoEditor;
    properties: PropertyEditor;
    article: ArticleEditor;
    lexicon: WordEditor;

    // EVENTS
    onOpen: EventProducer<Id, void>;
    onCleanUp: EventProducer<EntryViewKey, void>;

    constructor({ domain, synchronizer, wordEditor }: EntryEditorArguments) {
        this._domain = domain;
        this._synchronizer = synchronizer;

        this.info = new EntryInfoEditor();
        this.info.onChangeTitle.subscribe(() =>
            this._synchronizer.requestSynchronization({ syncTitle: true }),
        );

        this.article = new ArticleEditor({
            domain,
            info: this.info,
        });
        this.article.onChange.subscribe(() =>
            this._synchronizer.requestDelayedSynchronization(),
        );
        this.article.onSelectReference.subscribe((id) =>
            this.openArticleEditor({ id }),
        );

        this.properties = new PropertyEditor({
            info: this.info,
        });
        this.properties.onChange.subscribe(() =>
            this._synchronizer.requestDelayedSynchronization(),
        );

        this.lexicon = new WordEditor({
            domain,
            info: this.info,
            editableCellRef: wordEditor.editableCellRef,
        });
        this.lexicon.onChange.subscribe(() =>
            this._synchronizer.requestDelayedSynchronization(),
        );
        this.lexicon.onChangeWordType.subscribe(({ languageId, wordType }) =>
            this.openWordEditor(languageId, wordType),
        );

        this.onOpen = new EventProducer();
        this.onCleanUp = new EventProducer();

        makeAutoObservable<EntryEditor, PrivateKeys>(this, {
            _domain: false,
            _synchronizer: false,
            info: false,
            properties: false,
            article: false,
            lexicon: false,
            onOpen: false,
            onCleanUp: false,
        });
    }

    get key() {
        return ViewKey.EntryEditor;
    }

    get headerSpaceHeight() {
        return this.ENTRY_HEADER_SPACE_HEIGHT;
    }

    get belowHeaderSpaceHeight() {
        return this.DEFAULT_BELOW_HEADER_SPACE_HEIGHT;
    }

    get isArticleEditorOpen() {
        return this.currentView == EntryViewKey.ArticleEditor;
    }

    get isPropertyEditorOpen() {
        return this.currentView == EntryViewKey.PropertyEditor;
    }

    get isWordEditorOpen() {
        return this.currentView == EntryViewKey.WordEditor;
    }

    get currentView() {
        return this._viewKey;
    }

    set currentView(key: EntryViewKey) {
        if (this._viewKey == key) return;
        if (this._viewKey == EntryViewKey.WordEditor) this.lexicon.reset();
        this._viewKey = key;
    }

    get fieldData(): PropertyFieldData[] {
        return this.properties.fields[this.info.entityType as EntityType] ?? [];
    }

    initializeArticleEditor(
        id: Id,
        entityType: EntityType,
        title: string,
        text: string,
    ) {
        this.currentView = EntryViewKey.ArticleEditor;
        this.info.initialize(id, entityType, title);
        this.article.initialize(text);
        this.onOpen.produce(id);
    }

    async openArticleEditor({
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

        if (entityType && title !== undefined && text !== undefined)
            this.initializeArticleEditor(id, entityType, title, text);
    }

    initializePropertyEditor(
        id: Id,
        entityType: EntityType,
        title: string,
        properties: BaseEntity,
    ) {
        this.currentView = EntryViewKey.PropertyEditor;
        this.info.initialize(id, entityType, title);
        this.properties.initialize(properties);
        this.onOpen.produce(id);
    }

    async openPropertyEditor(id: Id) {
        if (this.isPropertyEditorOpen && this.info.id == id) return; // the property editor is already open

        const response = await this._domain.entries.getProperties(id);

        if (response !== null)
            this.initializePropertyEditor(
                id,
                response.info.entity_type,
                response.info.title,
                response.properties,
            );
    }

    async initializeWordEditor(id: number, title: string, wordType?: WordType) {
        this.currentView = EntryViewKey.WordEditor;
        this.info.initialize(id, EntityType.LANGUAGE, title);
        this.onOpen.produce(id);
        return this.lexicon.initialize(id, wordType);
    }

    async openWordEditor(languageId: Id, wordType?: WordType) {
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

        if (info !== null)
            this.initializeWordEditor(languageId, info.title, wordType);
    }

    fetchChanges({
        syncTitle = false,
        syncProperties = false,
        syncText = false,
        syncLexicon = false,
    }: PollEvent) {
        if (this.info.id === null || this.info.entityType === null) return [];

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

        return [entry];
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

    cleanUp() {
        this._synchronizer.requestFullSynchronization();
        this.onCleanUp.produce(this.currentView);
        this.lexicon.cleanUp();
    }

    reset() {
        this.info.reset();
        this.properties.reset();
        this.article.reset();
        this.lexicon.reset();
    }
}
