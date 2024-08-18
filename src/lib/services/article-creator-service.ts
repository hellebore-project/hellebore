import { makeAutoObservable } from "mobx";

import { ArticleResponse, Entity, EntityType } from "../interface";
import { createArticle } from "./data-service";

class ArticleCreatorService {
    entityType: EntityType | null = null;
    title: string = "";
    isTitleUnique: boolean = true;

    constructor() {
        makeAutoObservable(this);
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

    async createArticle(): Promise<ArticleResponse<Entity> | null> {
        let article: ArticleResponse<Entity> | null = null;

        try {
            article = await createArticle(this.title, this.entityType);
        } catch (error) {
            console.error(error);
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

export default ArticleCreatorService;
