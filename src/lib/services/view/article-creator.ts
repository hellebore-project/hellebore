import { makeAutoObservable } from "mobx";

import {
    ArticleResponse,
    BaseEntity,
    EntityType,
    ROOT_FOLDER_ID,
} from "@/interface";
import { ViewManager } from "./view-manager";

export class ArticleCreator {
    entityType: EntityType | null = null;
    title: string = "";
    isTitleUnique: boolean = true;

    view: ViewManager;

    constructor(view: ViewManager) {
        makeAutoObservable(this, { view: false });
        this.view = view;
    }

    setEntityType(entityType: EntityType | null = null) {
        this.entityType = entityType;
    }

    setTitle(title: string) {
        this.title = title;
    }

    setIsTitleUnique(isUnique: boolean) {
        this.isTitleUnique = isUnique;
    }

    async createArticle(
        folder_id: number = ROOT_FOLDER_ID,
    ): Promise<ArticleResponse<BaseEntity> | null> {
        const article = await this.view.domain.articles.create(
            this.entityType as EntityType,
            this.title,
            folder_id,
        );

        if (article == null) {
            // if the BE request fails, assume that it's a UNIQUE constraint violation
            this.setIsTitleUnique(false);
            return null;
        }

        this.reset();
        return article;
    }

    initialize(entityType: EntityType | null = null) {
        this.entityType = entityType;
        this.title = "";
        this.isTitleUnique = true;
    }

    reset() {
        this.entityType = null;
        this.title = "";
        this.isTitleUnique = true;
    }
}
