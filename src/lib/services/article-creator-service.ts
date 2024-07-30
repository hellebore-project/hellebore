import { makeAutoObservable, runInAction } from "mobx";
import { Entity, EntityType } from "../entities";
import { createLanguage } from "./data-service";

class ArticleCreatorService {
    entityType: EntityType | undefined = undefined;
    title: string = "";
    isTitleUnique: boolean = true;

    constructor() {
        makeAutoObservable(this);
    }

    setEntityType(entityType: EntityType | undefined) {
        this.entityType = entityType;
    }

    setTitle(title: string) {
        this.title = title;
    }

    setIsTitleUnique(isUnique: boolean) {
        this.isTitleUnique = isUnique;
    }

    async submit(): Promise<Entity | null> {
        let entity: Entity | null = null;

        try {
            if (this.entityType === EntityType.LANGUAGE)
                entity = await createLanguage({ name: this.title });
        } catch (error) {
            // if the BE request fails, assume that it's a UNIQUE constraint violation
            runInAction(() => (this.isTitleUnique = false));
            return null;
        }

        this.reset();
        return entity;
    }

    reset(entityType?: EntityType) {
        this.entityType = entityType;
        this.title = "";
        this.isTitleUnique = true;
    }
}

export default ArticleCreatorService;
