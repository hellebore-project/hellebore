import { makeAutoObservable } from "mobx";

import { EntityInfoResponse, EntityType, ROOT_FOLDER_ID } from "@/interface";
import { ViewManager } from "./view-manager";

export class EntityCreator {
    private _title: string = "";

    entityType: EntityType | null = null;
    isTitleUnique: boolean = true;

    view: ViewManager;

    constructor(view: ViewManager) {
        makeAutoObservable(this, { view: false });
        this.view = view;
    }

    setEntityType(entityType: EntityType | null = null) {
        this.entityType = entityType;
    }

    get title() {
        return this._title;
    }

    set title(title: string) {
        this._title = title;
    }

    setIsTitleUnique(isUnique: boolean) {
        this.isTitleUnique = isUnique;
    }

    async createEntity(
        folderId: number = ROOT_FOLDER_ID,
    ): Promise<EntityInfoResponse | null> {
        const article = await this.view.domain.entities.create(
            this.entityType as EntityType,
            this.title,
            folderId,
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
