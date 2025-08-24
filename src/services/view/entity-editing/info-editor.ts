import { makeAutoObservable } from "mobx";

import { ENTITY_TYPE_LABELS, EntityType } from "@/constants";
import { IViewManager } from "@/services/interface";

const ENTITY_ID_SENTINEL = -1;

export class EntityInfoEditor {
    _id: number = ENTITY_ID_SENTINEL;
    _entityType: EntityType | null = null;
    _title: string = "";
    _isTitleUnique: boolean = true;
    _titleChanged: boolean = false;

    // services
    view: IViewManager;

    constructor(view: IViewManager) {
        makeAutoObservable(this, { view: false });
        this.view = view;
    }

    get id() {
        return this._id;
    }

    set id(id: number) {
        this._id = id;
    }

    get entityType() {
        return this._entityType;
    }

    set entityType(type: EntityType | null) {
        this._entityType = type;
    }

    get entityTypeLabel() {
        return ENTITY_TYPE_LABELS[this.entityType as EntityType];
    }

    get title() {
        return this._title;
    }

    set title(title: string) {
        this._title = title;
        this._titleChanged = true;
    }

    get isTitleUnique() {
        return this._isTitleUnique;
    }

    set isTitleUnique(unique: boolean) {
        this._isTitleUnique = unique;
    }

    get titleChanged() {
        return this._titleChanged;
    }

    set titleChanged(changed: boolean) {
        this._titleChanged = changed;
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
        this.id = ENTITY_ID_SENTINEL;
        this.entityType = null;
        this.title = "";
        this.isTitleUnique = true;
        this.titleChanged = false;
    }
}
