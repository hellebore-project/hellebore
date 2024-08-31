import { makeAutoObservable } from "mobx";

import {
    ArticleResponse,
    BaseEntity,
    EntityType,
    ArticleUpdateResponse,
    FieldData,
} from "../../interface";
import { DomainService } from "../domain";
import { ArticleFieldTableService } from "./field-table-service";
import { ArticleBodyService, OpenArticleHandler } from "./body-service";
import { ArticleInfoService } from "./info-service";

const UPDATE_DELAY_MILLISECONDS = 5000;

interface SyncSettings {
    syncTitle?: boolean;
    syncEntity?: boolean;
    syncBody?: boolean;
}

export class ArticleEditorService {
    syncing: boolean = false;
    lastModified: number = 0;

    domain: DomainService;
    info: ArticleInfoService;
    fieldTable: ArticleFieldTableService;
    body: ArticleBodyService;

    constructor(
        domain: DomainService,
        onOpenAnotherArticle: OpenArticleHandler,
    ) {
        makeAutoObservable(this, {
            domain: false,
            info: false,
            fieldTable: false,
            body: false,
        });

        this.domain = domain;
        this.info = new ArticleInfoService();
        this.fieldTable = new ArticleFieldTableService({
            info: this.info,
            onChange: () => this._onChange(),
        });
        this.body = new ArticleBodyService({
            domain,
            info: this.info,
            onChange: () => this._onChange(),
            onOpenAnotherArticle,
        });
    }

    setTitle(title: string) {
        if (title != this.info.title) {
            this.info.setTitle(title);
            this._sync({
                syncTitle: true,
                syncEntity: false,
                syncBody: false,
            });
        }
    }

    get fieldData(): FieldData[] {
        return this.fieldTable.fields[this.info.entityType as EntityType] ?? [];
    }

    initialize<E extends BaseEntity>(article: ArticleResponse<E>) {
        this.info.initialize(article.id, article.entity_type, article.title);
        this.fieldTable.initialize(article.entity);
        this.body.initialize(article.body);
    }

    cleanUp() {
        this._sync({
            syncTitle: true,
            syncEntity: true,
            syncBody: true,
        });
    }

    reset() {
        this.info.reset();
        this.fieldTable.reset();
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
        if (syncTitle && this.info.titleChanged && this.info.title == "")
            syncTitle = false;
        if (!syncTitle && !syncEntity && !syncBody) return true;
        if (
            !this.info.titleChanged &&
            !this.fieldTable.changed &&
            !this.body.changed
        )
            return true;

        let response: ArticleUpdateResponse | null;
        try {
            response = await this.domain.articles.update({
                id: this.info.id,
                folder_id: null,
                entity_type: this.info.entityType as EntityType,
                title:
                    syncTitle && this.info.titleChanged
                        ? this.info.title
                        : null,
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
            this.info.sync();
            this.info.setIsTitleUnique(response.isTitleUnique ?? true);
        }
        if (syncEntity) this.fieldTable.sync();
        if (syncBody) this.body.sync();
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
