import { makeAutoObservable } from "mobx";

import {
    BaseEntity,
    EntityType,
    FieldData,
    EntityViewKey,
    WordType,
    Id,
    WordUpsertResponse,
    WordData,
} from "@/interface";
import {
    EntryTextUpdateResponse,
    EntryTitleUpdateResponse,
    EntryUpdateResponse,
} from "@/services/domain";
import { PropertyEditor } from "./property-editor";
import { ArticleTextEditor } from "./text-editor";
import { EntityInfoEditor } from "./info-editor";
import { ViewManagerInterface } from "../interface";
import { WordEditor } from "./word-editor";

const DEFAULT_SYNC_DELAY_TIME = 5000;

type PrivateKeys =
    | "_waitingForSync"
    | "_syncing"
    | "_lastModified"
    | "_lastSynced"
    | "_syncDelayTime";

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
    words: WordData[] | null;
}

interface SyncResponse {
    title: EntryTitleUpdateResponse | null;
    text: EntryTextUpdateResponse | null;
    properties: EntryUpdateResponse | null;
    lexicon: WordUpsertResponse[] | null;
}

export class EntityEditor {
    // CONSTANTS
    ENTITY_HEADER_SPACE_HEIGHT = 25;
    BELOW_ENTITY_HEADER_SPACE_HEIGHT = 40;
    TITLE_FIELD_HEIGHT = 36;

    // STATE
    private _viewKey: EntityViewKey = EntityViewKey.ArticleEditor;
    private _waitingForSync: boolean = false;
    private _syncing: boolean = false;
    private _lastModified: number = 0;
    private _lastSynced: number = 0;
    private _syncDelayTime: number = DEFAULT_SYNC_DELAY_TIME;

    // SERVICES
    view: ViewManagerInterface;
    info: EntityInfoEditor;
    properties: PropertyEditor;
    text: ArticleTextEditor;
    lexicon: WordEditor;

    constructor(view: ViewManagerInterface) {
        makeAutoObservable<EntityEditor, PrivateKeys>(this, {
            _waitingForSync: false,
            _syncing: false,
            _lastModified: false,
            _lastSynced: false,
            _syncDelayTime: false,
            view: false,
            info: false,
            properties: false,
            text: false,
            lexicon: false,
        });

        this.view = view;
        this.info = new EntityInfoEditor(view);

        const onChange = () => this._onChange();
        this.properties = new PropertyEditor({
            info: this.info,
            onChange,
        });
        this.text = new ArticleTextEditor({
            view: view,
            info: this.info,
            onChange,
        });
        this.lexicon = new WordEditor({ view, info: this.info, onChange });
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

    set currentView(key: EntityViewKey) {
        if (this._viewKey == key) return;
        if (this._viewKey == EntityViewKey.WordEditor) this.lexicon.reset();
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

    get fieldData(): FieldData[] {
        return this.properties.fields[this.info.entityType as EntityType] ?? [];
    }

    initializeArticleEditor(id: Id, title: string, text: string) {
        this.currentView = EntityViewKey.ArticleEditor;
        this.info.initialize(id, title);
        this.text.initialize(text);
    }

    initializePropertyEditor(id: Id, title: string, properties: BaseEntity) {
        this.currentView = EntityViewKey.PropertyEditor;
        this.info.initialize(id, title);
        this.properties.initialize(properties);
    }

    async initializeWordEditor(id: number, title: string, wordType?: WordType) {
        this.currentView = EntityViewKey.WordEditor;
        this.info.initialize(id, title, EntityType.LANGUAGE);
        return this.lexicon.initialize(id, wordType);
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
        this.text.reset();
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
            !this.text.changed &&
            !this.lexicon.changed
        )
            return new Promise(() => false);

        let title =
            syncTitle && this.info.titleChanged && this.info.title
                ? this.info.title
                : null;
        let properties =
            syncProperties &&
            this.properties.changed &&
            this.properties.data != null
                ? this.properties.data
                : null;
        let text = syncText && this.text.changed ? this.text.serialized : null;
        let words =
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
        title,
        properties,
        text,
        words,
    }: SyncRequest): Promise<SyncResponse> {
        let titleUpdateResponse: EntryTitleUpdateResponse | null = null;
        if (typeof title === "string")
            titleUpdateResponse = await this.view.updateEntityTitle(id, title);

        let textUpdateResponse: EntryTextUpdateResponse | null = null;
        if (typeof text === "string")
            textUpdateResponse = await this.view.domain.entries.updateText(
                id,
                text,
            );

        let propertiesResponse: EntryUpdateResponse | null = null;
        if (properties)
            propertiesResponse = await this.view.domain.entries.update(
                id,
                properties,
            );

        let lexiconResponse: WordUpsertResponse[] | null = null;
        if (words) {
            try {
                lexiconResponse = await this.view.updateLexicon(words);
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
            this.info.sync();
            this.info.isTitleUnique = title.isUnique ?? true;
        }

        if (text && text.updated) this.text.sync();

        if (properties && properties.updated) this.properties.sync();

        if (request.words && lexicon) {
            const words: WordData[] = request.words.map((word, i) => {
                const wordResponse = lexicon[i];
                return {
                    ...word,
                    id: wordResponse.id,
                    created: wordResponse.created,
                    updated: wordResponse.updated,
                };
            });
            this.lexicon.sync(words);
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
