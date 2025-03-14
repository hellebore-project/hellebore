import { makeAutoObservable } from "mobx";

import {
    ArticleResponse,
    BaseEntity,
    EntityType,
    ArticleUpdateResponse,
    FieldData,
    EntityViewKey,
    ViewKey,
    WordType,
    Id,
    WordUpsertResponse,
    WordData,
} from "@/interface";
import { ArticleUpdateArguments } from "@/services/domain";
import { PropertyTableEditor } from "./property-table-editor";
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

export type UpdateArticleHandler = (
    update: ArticleUpdateArguments,
) => Promise<ArticleUpdateResponse | null>;

interface SyncSettings {
    syncTitle?: boolean;
    syncProperties?: boolean;
    syncArticleText?: boolean;
    syncLexicon?: boolean;
}

interface SyncRequest {
    id: Id;
    entityType: EntityType;
    title?: string | null;
    properties?: BaseEntity | null;
    articleText?: string | null;
    words: WordData[] | null;
}

interface SyncResponse {
    article: ArticleUpdateResponse | null;
    lexicon: WordUpsertResponse[] | null;
}

export class EntityEditor {
    private _viewKey: EntityViewKey = EntityViewKey.ARTICLE_EDITOR;
    private _waitingForSync: boolean = false;
    private _syncing: boolean = false;
    private _lastModified: number = 0;
    private _lastSynced: number = 0;
    private _syncDelayTime: number = DEFAULT_SYNC_DELAY_TIME;

    view: ViewManagerInterface;
    info: EntityInfoEditor;
    properties: PropertyTableEditor;
    articleText: ArticleTextEditor;
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
            articleText: false,
            lexicon: false,
        });

        this.view = view;
        this.info = new EntityInfoEditor();

        const onChange = () => this._onChange();
        this.properties = new PropertyTableEditor({
            info: this.info,
            onChange,
        });
        this.articleText = new ArticleTextEditor({
            view: view,
            info: this.info,
            onChange,
        });
        this.lexicon = new WordEditor({ view, info: this.info, onChange });
    }

    get currentView() {
        return this._viewKey;
    }

    set currentView(key: EntityViewKey) {
        if (this._viewKey == key) return;
        if (this._viewKey == EntityViewKey.WORD_EDITOR) this.lexicon.reset();
        this._viewKey = key;
    }

    get isArticleEditorOpen() {
        return (
            this.view.currentView == ViewKey.ENTITY_EDITOR &&
            this.currentView == EntityViewKey.ARTICLE_EDITOR
        );
    }

    get isWordEditorOpen() {
        return (
            this.view.currentView == ViewKey.ENTITY_EDITOR &&
            this.currentView == EntityViewKey.WORD_EDITOR
        );
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

    initializeArticleEditor<E extends BaseEntity>(article: ArticleResponse<E>) {
        this.currentView = EntityViewKey.ARTICLE_EDITOR;
        this.info.initialize(article.id, article.entity_type, article.title);
        this.properties.initialize(article.entity);
        this.articleText.initialize(article.body);
    }

    initializeWordEditor(id: number, title: string) {
        this.currentView = EntityViewKey.WORD_EDITOR;
        this.info.initialize(id, EntityType.LANGUAGE, title);
        this.lexicon.initialize(id, WordType.RootWord);
    }

    cleanUp() {
        this.sync({
            syncTitle: true,
            syncProperties: true,
            syncArticleText: true,
            syncLexicon: true,
        });
    }

    reset() {
        this.info.reset();
        this.properties.reset();
        this.articleText.reset();
        this.lexicon.reset();
    }

    private async _delayedSync({
        syncTitle = false,
        syncProperties = false,
        syncArticleText = false,
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
            syncArticleText,
            syncLexicon,
        });
    }

    sync({
        syncTitle = false,
        syncProperties = false,
        syncArticleText = false,
        syncLexicon = false,
    }: SyncSettings): Promise<boolean> {
        if (!syncTitle && !syncProperties && !syncArticleText)
            return new Promise(() => false);
        if (
            !this.info.titleChanged &&
            !this.properties.changed &&
            !this.articleText.changed &&
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
        let articleText =
            syncArticleText && this.articleText.changed
                ? this.articleText.serialized
                : null;
        let words =
            syncLexicon && this.lexicon.changed
                ? this.lexicon.claimModifiedWords()
                : null;

        const request = {
            id: this.info.id,
            entityType: this.info.entityType as EntityType,
            title,
            properties,
            articleText,
            words,
        };
        // the last synced time corresponds to the moment that the view data is retrieved
        this._lastSynced = Date.now();
        // the syncing flag is set to true as soon as the request is prepared;
        // this forces the delayed sync event to be delayed until the current sync event is handled
        this._syncing = true;
        // the waiting-for-sync flag is set to false to permit the creation of a delayed sync event
        this._waitingForSync = false;

        console.log(this);
        console.log(request);
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
        articleText,
        words,
    }: SyncRequest): Promise<SyncResponse> {
        let articleResponse: ArticleUpdateResponse | null = null;
        try {
            articleResponse = await this.view.updateArticle({
                id,
                entity_type: entityType,
                title,
                entity: properties,
                body: articleText,
            });
        } catch (error) {
            console.error("Failed to update article.");
            console.error(error);
        }
        if (articleResponse == null) console.error("Failed to update article.");

        let lexiconResponse: WordUpsertResponse[] | null = null;
        if (words) {
            try {
                lexiconResponse = await this.view.updateLexicon(words);
            } catch (error) {
                console.error("Failed to update lexicon.");
                console.error(error);
            }
            if (lexiconResponse == null)
                console.error("Failed to update lexicon.");
        }

        return {
            article: articleResponse,
            lexicon: lexiconResponse,
        };
    }

    private _afterSync(
        request: SyncRequest,
        { article, lexicon }: SyncResponse,
    ) {
        if (this.info.id != request.id) return;

        if (article) {
            if (article.titleChanged) {
                this.info.sync();
                this.info.isTitleUnique = article.isTitleUnique ?? true;
            }
            if (article.propertiesChanged) this.properties.sync();
            if (article.textChanged) this.articleText.sync();
        }

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
                syncArticleText: true,
                syncLexicon: true,
            }).then(() => (this._waitingForSync = false));
        }
    }
}
