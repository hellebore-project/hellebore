import { makeAutoObservable } from "mobx";

import {
    ArticleResponse,
    BaseEntity,
    EntityType,
    ArticleUpdateResponse,
    FieldData,
} from "../../interface";
import DataService from "../data";
import ArticleFieldTableService from "./article-field-table-service";
import { ArticleBodyService, OpenArticleHandler } from "./article-body-service";

const ARTICLE_ID_SENTINEL = -1;
const UPDATE_DELAY_MILLISECONDS = 5000;

interface SyncSettings {
    syncTitle?: boolean;
    syncEntity?: boolean;
    syncBody?: boolean;
}

class ArticleEditorService {
    id: number = ARTICLE_ID_SENTINEL;
    title: string = "";
    entityType: EntityType | null = null;

    syncing: boolean = false;
    lastModified: number = 0;
    isTitleUnique: boolean = true;
    titleChanged: boolean = false;

    data: DataService;
    fieldTable: ArticleFieldTableService;
    body: ArticleBodyService;

    constructor(
        dataService: DataService,
        onOpenAnotherArticle: OpenArticleHandler,
    ) {
        makeAutoObservable(this, { data: false });

        this.data = dataService;
        this.fieldTable = new ArticleFieldTableService({
            onChange: () => this._onChange(),
        });
        this.body = new ArticleBodyService({
            dataService,
            getID: () => this.id,
            onChange: () => this._onChange(),
            onOpenAnotherArticle,
        });
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

    get fieldData(): FieldData[] {
        return this.fieldTable.fieldData[this.entityType as EntityType] ?? [];
    }

    initialize<E extends BaseEntity>(article: ArticleResponse<E>) {
        this.id = article.id;
        this.title = article.title;
        this.isTitleUnique = true;
        this.entityType = article.entity_type;
        this.fieldTable.entityData = article.entity;
        this.body.content = article.body ? JSON.parse(article.body) : "";
    }

    cleanUp() {
        this._sync({
            syncTitle: true,
            syncEntity: true,
            syncBody: true,
        });
    }

    reset() {
        this.id = ARTICLE_ID_SENTINEL;
        this.title = "";
        this.isTitleUnique = true;
        this.entityType = null;
        this.fieldTable.entityData = null;
        this.body.reset();
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
        if (
            !this.titleChanged &&
            !this.fieldTable.changed &&
            !this.body.changed
        )
            return true;

        let response: ArticleUpdateResponse | null;
        try {
            response = await this.data.articles.update({
                id: this.id,
                entity_type: this.entityType as EntityType,
                title: syncTitle && this.titleChanged ? this.title : null,
                entity:
                    syncEntity && this.fieldTable.changed
                        ? this.fieldTable.entityData
                        : null,
                body: syncBody && this.body.changed ? this.body.text : null,
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
        }
        if (syncEntity) this.fieldTable.changed = false;
        if (syncBody) this.body.changed = false;
        console.log(this.body.content);

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
}

export default ArticleEditorService;
