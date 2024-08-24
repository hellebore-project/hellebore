import { makeAutoObservable } from "mobx";

import { ArticleResponse, ArticleData, EntityType } from "../interface";
import { DataService } from "./data-service";

class ArticleCreatorService {
    entityType: EntityType | null = null;
    title: string = "";
    isTitleUnique: boolean = true;

    data: DataService;

    constructor(dataService: DataService) {
        makeAutoObservable(this, { data: false });
        this.data = dataService;
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

    async createArticle(): Promise<ArticleResponse<ArticleData> | null> {
        const article = await this.data.articles.create(
            this.title,
            this.entityType,
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

export default ArticleCreatorService;
