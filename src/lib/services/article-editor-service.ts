import { Node as PMNode } from "prosemirror-model";
import { Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { makeAutoObservable, toJS } from "mobx";

import {
    ArticleResponse,
    ArticleData,
    EntityType,
    ArticleUpdateResponse,
    Suggestion,
} from "../interface";
import { DataService } from "./data-service";
import { useReferenceExtension } from "../shared/rich-text-editor";

const ARTICLE_ID_SENTINAL = -1;
const UPDATE_DELAY_MILLISECONDS = 5000;

type OpenArticleHandler = (id: number) => void;

interface SyncSettings {
    syncTitle?: boolean;
    syncEntity?: boolean;
    syncBody?: boolean;
}

class ArticleEditorService {
    id: number = ARTICLE_ID_SENTINAL;
    title: string = "";
    entityType: EntityType | null = null;
    entity: ArticleData | null = null;
    editor: Editor;

    syncing: boolean = false;
    lastModified: number = 0;
    isTitleUnique: boolean = true;
    titleChanged: boolean = false;
    entityChanged: boolean = false;
    bodyChanged: boolean = false;
    selectedRefIndex: number | null = null;

    data: DataService;

    onOpenAnotherArticle: OpenArticleHandler | null = null;

    constructor(
        dataService: DataService,
        onOpenAnotherArticle: OpenArticleHandler,
    ) {
        makeAutoObservable(this, { data: false, onOpenAnotherArticle: false });
        this.data = dataService;
        this.onOpenAnotherArticle = onOpenAnotherArticle;
        this.editor = this._buildEditor();
    }

    get entityData() {
        return toJS(this.entity);
    }

    get bodyText() {
        return JSON.stringify(this.editor.getJSON());
    }

    setTitle(title: string) {
        if (title != this.title) {
            this.title = title;
            this.titleChanged = true;

            this._sync({
                syncTitle: true,
                syncEntity: false,
                syncBody: false,
            });
        }
    }

    setIsTitleUnique(unique: boolean) {
        this.isTitleUnique = unique;
    }

    setEntity(entity: ArticleData | null) {
        this.entity = entity;
        this.entityChanged = true;
        this._onChange();
    }

    setSelectedRefIndex(index: number | null) {
        this.selectedRefIndex = index;
    }

    initialize<E extends ArticleData>(article: ArticleResponse<E>) {
        this.id = article.id;
        this.title = article.title;
        this.isTitleUnique = true;
        this.entityType = article.entity_type;
        this.entity = article.entity;
        const body = article.body ? JSON.parse(article.body) : "";
        this.editor.commands.setContent(body);
    }

    cleanUp() {
        this._sync({
            syncTitle: true,
            syncEntity: true,
            syncBody: true,
        });
    }

    reset() {
        this.id = ARTICLE_ID_SENTINAL;
        this.title = "";
        this.isTitleUnique = true;
        this.entityType = null;
        this.entity = null;
        this.editor.commands.clearContent();
    }

    _buildEditor() {
        const Reference = useReferenceExtension({
            queryItems: ({ query }) => this._queryByTitle(query),
            getSelectedIndex: () => this.selectedRefIndex,
            setSelectedIndex: (index) => this.setSelectedRefIndex(index),
        });

        return new Editor({
            extensions: [StarterKit, Reference],
            onUpdate: ({ editor }) => {
                this._updateEditor(editor as Editor);
            },
            editorProps: {
                handleClickOn: (_, __, node) => this._onClickEditor(node),
            },
        });
    }

    _updateEditor(editor: Editor) {
        this.editor = editor;
        this.bodyChanged = true;
        this._onChange();
    }

    _queryByTitle(titleFragment: string): Suggestion[] {
        return this.data.articles
            .queryByTitle(titleFragment)
            .filter((info) => info.id != this.id)
            .map((info) => ({ label: info.title, value: info.id }));
    }

    async _syncDelay({
        syncTitle = true,
        syncEntity = true,
        syncBody = true,
    }: SyncSettings) {
        while (Date.now() - this.lastModified < UPDATE_DELAY_MILLISECONDS) {
            await new Promise((r) => setTimeout(r, UPDATE_DELAY_MILLISECONDS));
        }
        if (!this.syncing)
            // terminate early if the article editor was synced with the BE during the delay
            return true;
        return this._sync({ syncTitle, syncEntity, syncBody });
    }

    async _sync({
        syncTitle = true,
        syncEntity = true,
        syncBody = true,
    }: SyncSettings) {
        if (syncTitle && this.titleChanged && this.title == "")
            syncTitle = false;
        if (!syncTitle && !syncEntity && !syncBody) return true;
        if (!this.titleChanged && !this.entityChanged && !this.bodyChanged)
            return true;

        let response: ArticleUpdateResponse | null;
        try {
            response = await this.data.articles.update({
                id: this.id,
                entity_type: this.entityType as EntityType,
                title: syncTitle && this.titleChanged ? this.title : null,
                entity:
                    syncEntity && this.entityChanged ? this.entityData : null,
                body: syncBody && this.bodyChanged ? this.bodyText : null,
            });
        } catch (error) {
            console.error("Failed to update article.");
            console.error(error);
            return false;
        }
        if (response == null) {
            console.error("Failed to update article.");
            return false;
        }

        this.syncing = false;
        if (syncTitle) {
            this.titleChanged = false;
            this.setIsTitleUnique(response.isTitleUnique ?? true);
            let updatedTitle: string | null = null;
            if (this.title != "" && this.isTitleUnique)
                updatedTitle = this.title;
        }
        if (syncEntity) this.entityChanged = false;
        if (syncBody) this.bodyChanged = false;
        console.log(this.editor.getJSON());

        return true;
    }

    _onChange() {
        this.lastModified = Date.now();
        if (!this.syncing) {
            this.syncing = true;
            this._syncDelay({
                syncTitle: true,
                syncEntity: true,
                syncBody: true,
            }).then(() => (this.syncing = false));
        }
    }

    _onClickEditor(node: PMNode) {
        if (node.type.name == "mention") {
            const articleID: number | null = node.attrs["id"] ?? null;
            if (articleID != null) this.onOpenAnotherArticle?.(articleID);
        }
    }
}

export default ArticleEditorService;
