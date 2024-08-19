import { makeAutoObservable, toJS } from "mobx";
import { Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import {
    ApiError,
    ArticleResponse,
    Entity,
    EntityType,
    UpdateResponse,
} from "../interface";
import { updateArticle } from "./data-service";

const ARTICLE_ID_SENTINAL = -1;
const UPDATE_DELAY_MILLISECONDS = 5000;

type TitleChangeHandler = (
    id: number,
    entityType: EntityType,
    title: string | null,
) => void;

interface SyncSettings {
    syncTitle?: boolean;
    syncEntity?: boolean;
    syncBody?: boolean;
}

class ArticleEditorService {
    id: number = ARTICLE_ID_SENTINAL;
    title: string = "";
    entityType: EntityType | null = null;
    entity: Entity | null = null;
    editor: Editor;

    synced: boolean = true;
    lastModified: number = 0;
    isTitleUnique: boolean = true;
    titleChanged: boolean = false;
    entityChanged: boolean = false;
    bodyChanged: boolean = false;

    onChangeTitle: TitleChangeHandler | null = null;

    constructor() {
        makeAutoObservable(this, { onChangeTitle: false });
        this.editor = new Editor({
            extensions: [StarterKit],
            onUpdate: ({ editor }) => {
                this._updateEditor(editor as Editor);
            },
        });
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

    setEntity(entity: Entity | null) {
        this.entity = entity;
        this.entityChanged = true;
        this._onChange();
    }

    initialize<E extends Entity>(article: ArticleResponse<E>) {
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

    _updateEditor(editor: Editor) {
        this.editor = editor;
        this.bodyChanged = true;
        this._onChange();
    }

    async _syncDelay({
        syncTitle = true,
        syncEntity = true,
        syncBody = true,
    }: SyncSettings) {
        while (Date.now() - this.lastModified < UPDATE_DELAY_MILLISECONDS) {
            await new Promise((r) => setTimeout(r, UPDATE_DELAY_MILLISECONDS));
        }
        return this._sync({ syncTitle, syncEntity, syncBody });
    }

    async _sync({
        syncTitle = true,
        syncEntity = true,
        syncBody = true,
    }: SyncSettings) {
        if (!syncTitle && !syncEntity && !syncBody) return null;
        if (!this.titleChanged && !this.entityChanged && !this.bodyChanged)
            return null;

        if (syncTitle && this.titleChanged && this.title == "")
            syncTitle = false;

        let response: UpdateResponse<null> | null;
        try {
            response = await updateArticle({
                id: this.id,
                entity_type: this.entityType as EntityType,
                title: syncTitle && this.titleChanged ? this.title : null,
                entity:
                    syncEntity && this.entityChanged ? this.entityData : null,
                body: syncBody && this.bodyChanged ? this.bodyText : null,
            });
        } catch (error) {
            console.error("Failed to update article.");
            console.log(error);
            return null;
        }
        if (response == null) {
            console.error("Failed to update article.");
            return null;
        }

        this._handleErrors(response.errors);

        this.synced = true;
        if (syncTitle) {
            this.titleChanged = false;
            let updatedTitle: string | null = null;
            if (this.title != "" && this.isTitleUnique)
                updatedTitle = this.title;
            this.onChangeTitle?.(
                this.id,
                this.entityType as EntityType,
                updatedTitle,
            );
        }
        if (syncEntity) this.entityChanged = false;
        if (syncBody) this.bodyChanged = false;

        return response;
    }

    _handleErrors(errors: ApiError[]) {
        let isTitleUnique = true;
        for (let error of errors) {
            console.log(error);
            if ("FieldNotUpdated" in error) {
                const { msg, entity, field } = error["FieldNotUpdated"];
                if (
                    msg == "Title is not unique." &&
                    entity == "Article" &&
                    field == "title"
                )
                    isTitleUnique = false;
            }
        }
        this.isTitleUnique = isTitleUnique;
    }

    _onChange() {
        this.lastModified = Date.now();
        if (this.synced) {
            this.synced = false;
            this._syncDelay({
                syncTitle: true,
                syncEntity: true,
                syncBody: true,
            });
        }
    }
}

export default ArticleEditorService;
