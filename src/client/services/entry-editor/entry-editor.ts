import { makeAutoObservable } from "mobx";

import { Id } from "@/interface";
import { EntryViewKey, ViewKey } from "@/client/constants";
import {
    IClientManager,
    IViewManager,
    PropertyFieldData,
    Word,
} from "@/client/interface";
import {
    BaseEntity,
    EntryTextUpdateResponse,
    EntryTitleUpdateResponse,
    EntryUpdateResponse,
    WordUpsertResponse,
    EntityType,
    WordType,
} from "@/domain";
import { ObservableReference } from "@/shared/observable-reference";
import { EventProducer } from "@/utils/event";

import { WordEditor } from "./word-editor";
import { EntityInfoEditor } from "./info-editor";
import { ArticleEditor } from "./article-editor";
import { PropertyEditor } from "./property-editor";

const DEFAULT_SYNC_DELAY_TIME = 5000;

type PrivateKeys =
    | "_waitingForSync"
    | "_syncing"
    | "_lastModified"
    | "_lastSynced"
    | "_syncDelayTime"
    | "_client";

export interface EntryEditorArguments {
    client: IClientManager;
    wordEditor: {
        editableCellRef: ObservableReference<HTMLInputElement>;
    };
}

interface ChangeTitleEvent {
    id: Id;
    title: string;
    isUnique: boolean;
}

interface SyncSettings {
    syncTitle?: boolean;
    syncProperties?: boolean;
    syncText?: boolean;
    syncLexicon?: boolean;
}

interface SyncRequest {
    id: Id;
    entityType: EntityType;
    title?: string | null;
    properties?: BaseEntity | null;
    text?: string | null;
    words: Word[] | null;
}

interface SyncResponse {
    title: EntryTitleUpdateResponse | null;
    text: EntryTextUpdateResponse | null;
    properties: EntryUpdateResponse | null;
    lexicon: WordUpsertResponse[] | null;
}

export class EntryEditor implements IViewManager {
    // CONSTANTS
    ENTITY_HEADER_SPACE_HEIGHT = 25;
    BELOW_ENTITY_HEADER_SPACE_HEIGHT = 40;
    TITLE_FIELD_HEIGHT = 36;

    // STATE
    private _viewKey: EntryViewKey = EntryViewKey.ArticleEditor;
    private _waitingForSync = false;
    private _syncing = false;
    private _lastModified = 0;
    private _lastSynced = 0;
    private _syncDelayTime: number = DEFAULT_SYNC_DELAY_TIME;

    // SERVICES
    private _client: IClientManager;
    info: EntityInfoEditor;
    properties: PropertyEditor;
    article: ArticleEditor;
    lexicon: WordEditor;

    // EVENTS
    onOpen: EventProducer<Id, void>;
    onChangeTitle: EventProducer<ChangeTitleEvent, void>;

    constructor({ client, wordEditor }: EntryEditorArguments) {
        this._client = client;
        this.info = new EntityInfoEditor();

        const onChange = () => this._onChange();
        this.properties = new PropertyEditor({
            info: this.info,
            onChange,
        });
        this.article = new ArticleEditor({
            client,
            info: this.info,
            onChange,
        });
        this.lexicon = new WordEditor({
            client,
            info: this.info,
            editableCellRef: wordEditor.editableCellRef,
            onChange,
        });

        this.onOpen = new EventProducer();
        this.onChangeTitle = new EventProducer();

        makeAutoObservable<EntryEditor, PrivateKeys>(this, {
            _waitingForSync: false,
            _syncing: false,
            _lastModified: false,
            _lastSynced: false,
            _syncDelayTime: false,
            _client: false,
            info: false,
            properties: false,
            article: false,
            lexicon: false,
            onOpen: false,
            onChangeTitle: false,
        });
    }

    get key() {
        return ViewKey.EntryEditor;
    }

    get entityHeaderSpaceHeight() {
        return this.ENTITY_HEADER_SPACE_HEIGHT;
    }

    get belowEntityHeaderSpaceHeight() {
        return this.BELOW_ENTITY_HEADER_SPACE_HEIGHT;
    }

    get currentView() {
        return this._viewKey;
    }

    set currentView(key: EntryViewKey) {
        if (this._viewKey == key) return;
        if (this._viewKey == EntryViewKey.WordEditor) this.lexicon.reset();
        this._viewKey = key;
    }

    get title() {
        return this.info.title;
    }

    set title(title: string) {
        if (title != this.info.title) {
            this.info.title = title;
            this.sync({
                syncTitle: true,
            });
        }
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

    async initializeWordEditor(id: number, title: string, wordType?: WordType) {
        this.currentView = EntryViewKey.WordEditor;
        this.info.initialize(id, EntityType.LANGUAGE, title);
        this.onOpen.produce(id);
        return this.lexicon.initialize(id, wordType);
    }

    private async _updateEntryTitle(id: Id, title: string) {
        const response = await this._client.domain.entries.updateTitle(
            id,
            title,
        );
        this.onChangeTitle.produce({ id, title, isUnique: response.isUnique });
        return response;
    }

    cleanUp() {
        this.sync({
            syncTitle: true,
            syncProperties: true,
            syncText: true,
            syncLexicon: true,
        });
        this.lexicon.cleanUp();
    }

    reset() {
        this.info.reset();
        this.properties.reset();
        this.article.reset();
        this.lexicon.reset();
    }

    private async _delayedSync({
        syncTitle = false,
        syncProperties = false,
        syncText = false,
        syncLexicon = false,
    }: SyncSettings) {
        while (true) {
            await new Promise((r) => setTimeout(r, this._syncDelayTime));

            // if the backend has already been synced with the view since the last change event,
            // cancel the sync
            if (this._lastSynced > this._lastModified) return false;

            // if too little time has passed since the last change event in the view, delay the sync again
            if (Date.now() - this._lastModified < this._syncDelayTime) continue;

            // if the backend is currently being synced, delay the sync again
            if (this._syncing) continue;

            // otherwise, proceed with the sync
            break;
        }
        return this.sync({
            syncTitle,
            syncProperties,
            syncText,
            syncLexicon,
        });
    }

    sync({
        syncTitle = false,
        syncProperties = false,
        syncText = false,
        syncLexicon = false,
    }: SyncSettings): Promise<boolean> {
        // NOTE: this function must run synchronously

        if (!syncTitle && !syncProperties && !syncText)
            return new Promise(() => false);
        if (
            !this.info.titleChanged &&
            !this.properties.changed &&
            !this.article.changed &&
            !this.lexicon.changed
        )
            return new Promise(() => false);

        const title =
            syncTitle && this.info.titleChanged && this.info.title
                ? this.info.title
                : null;
        const properties =
            syncProperties &&
            this.properties.changed &&
            this.properties.data != null
                ? this.properties.data
                : null;
        const text =
            syncText && this.article.changed ? this.article.serialized : null;
        const words =
            syncLexicon && this.lexicon.changed
                ? this.lexicon.claimModifiedWords()
                : null;

        const request: SyncRequest = {
            id: this.info.id,
            entityType: this.info.entityType as EntityType,
            title,
            properties,
            text,
            words,
        };
        // the last synced time corresponds to the moment that the view data is retrieved
        this._lastSynced = Date.now();
        // the syncing flag is set to true as soon as the request is prepared;
        // this forces the delayed sync event to be delayed until the current sync event is handled
        this._syncing = true;
        // the waiting-for-sync flag is set to false to permit the creation of a delayed sync event
        this._waitingForSync = false;

        return this._sync(request).then((response) => {
            this._syncing = false;
            if (!response) return false;
            this._afterSync(request, response);
            return true;
        });
    }

    private async _sync({
        id,
        entityType,
        title,
        properties,
        text,
        words,
    }: SyncRequest): Promise<SyncResponse> {
        // TODO: rework this so that the data gets sent in a single IPC call.
        // syncing the entity via multiple IPC calls is really bad

        let titleUpdateResponse: EntryTitleUpdateResponse | null = null;
        if (typeof title === "string")
            titleUpdateResponse = await this._updateEntryTitle(id, title);

        let textUpdateResponse: EntryTextUpdateResponse | null = null;
        if (typeof text === "string")
            textUpdateResponse = await this._client.domain.entries.updateText(
                id,
                text,
            );

        let propertiesResponse: EntryUpdateResponse | null = null;
        if (properties)
            propertiesResponse =
                await this._client.domain.entries.updateProperties(
                    id,
                    entityType,
                    properties,
                );

        let lexiconResponse: WordUpsertResponse[] | null = null;
        if (words) {
            try {
                lexiconResponse = await this._client.updateLexicon(words);
            } catch (error) {
                console.error("Failed to update lexicon.");
                console.error(error);
            }
            if (lexiconResponse === null)
                console.error("Failed to update lexicon.");
        }

        return {
            title: titleUpdateResponse,
            text: textUpdateResponse,
            properties: propertiesResponse,
            lexicon: lexiconResponse,
        };
    }

    private _afterSync(
        request: SyncRequest,
        { title, text, properties, lexicon }: SyncResponse,
    ) {
        if (this.info.id != request.id) return;

        if (title && title.updated) {
            this.info.afterSync();
            this.info.isTitleUnique = title.isUnique ?? true;
        }

        if (text && text.updated) this.article.afterSync();

        if (properties && properties.updated) this.properties.afterSync();

        if (request.words && lexicon) {
            const words: Word[] = request.words.map((word, i) => {
                const wordResponse = lexicon[i];
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

    private _onChange() {
        this._lastModified = Date.now();
        if (!this._waitingForSync) {
            this._waitingForSync = true;
            this._delayedSync({
                syncTitle: true,
                syncProperties: true,
                syncText: true,
                syncLexicon: true,
            }).then(() => (this._waitingForSync = false));
        }
    }
}
