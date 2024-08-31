import { makeAutoObservable } from "mobx";

import { ENTITY_TYPE_LABELS, EntityType } from "../../interface";

const ARTICLE_ID_SENTINEL = -1;

export class ArticleInfoService {
    id: number = ARTICLE_ID_SENTINEL;
    entityType: EntityType | null = null;
    title: string = "";
    isTitleUnique: boolean = true;
    titleChanged: boolean = false;

    constructor() {
        makeAutoObservable(this);
    }

    setId(id: number) {
        this.id = id;
    }

    get entityTypeLabel() {
        return ENTITY_TYPE_LABELS[this.entityType as EntityType];
    }

    setEntityType(type: EntityType | null) {
        this.entityType = type;
    }

    setTitle(title: string) {
        this.title = title;
        this.titleChanged = true;
    }

    setIsTitleUnique(unique: boolean) {
        this.isTitleUnique = unique;
    }

    setTitleChanged(changed: boolean) {
        this.titleChanged = changed;
    }

    initialize(id: number, type: EntityType, title: string) {
        this.id = id;
        this.entityType = type;
        this.title = title;
        this.isTitleUnique = true;
        this.titleChanged = false;
    }

    sync() {
        this.titleChanged = false;
    }

    reset() {
        this.id = ARTICLE_ID_SENTINEL;
        this.entityType = null;
        this.title = "";
        this.isTitleUnique = true;
        this.titleChanged = false;
    }
}
