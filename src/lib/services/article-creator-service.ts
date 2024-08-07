import { makeAutoObservable, runInAction } from "mobx";

import { Article, IdentifiedEntity, EntityType } from "../interface";
import { createLanguage } from "./data-service";

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

    async submit(): Promise<Article<IdentifiedEntity> | null> {
        let entity: Article<IdentifiedEntity> | null = null;

        console.log(this.entityType);
        try {
            if (this.entityType === EntityType.LANGUAGE)
                entity = await createLanguage({ name: this.title });
            console.log(entity);
        } catch (error) {
            // if the BE request fails, assume that it's a UNIQUE constraint violation
            runInAction(() => (this.isTitleUnique = false));
            return null;
        }

        this.reset();
        return entity;
    }

    reset(entityType: EntityType | null = null) {
        this.entityType = entityType;
        this.title = "";
        this.isTitleUnique = true;
    }
}

export default ArticleCreatorService;
