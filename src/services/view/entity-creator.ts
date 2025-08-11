import { makeAutoObservable } from "mobx";

import { EntityType, Id, ROOT_FOLDER_ID } from "@/interface";
import { ViewManagerInterface } from "./interface";
import { FormEvent } from "react";

export class EntityCreator {
    // STATE
    private _title: string = "";
    private _folderId: Id = ROOT_FOLDER_ID;
    private _entityType: EntityType | null = null;
    private _isTitleUnique: boolean = true;

    // SERVICES
    view: ViewManagerInterface;

    constructor(view: ViewManagerInterface) {
        makeAutoObservable(this, { view: false });
        this.view = view;
    }

    setEntityType(entityType: EntityType | null = null) {
        this._entityType = entityType;
    }

    get title() {
        return this._title;
    }

    set title(title: string) {
        this._title = title;
    }

    get entityType() {
        return this._entityType;
    }

    get isTitleUnique() {
        return this._isTitleUnique;
    }

    set isTitleUnique(isUnique: boolean) {
        this._isTitleUnique = isUnique;
    }

    initialize(entityType: EntityType | null = null, folderId?: Id) {
        this._entityType = entityType;
        this._folderId = folderId ?? ROOT_FOLDER_ID;
        this.title = "";
        this._isTitleUnique = true;
    }

    async submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const entity = this.view.createEntity(
            this.entityType as EntityType,
            this._title,
            this._folderId,
        );

        if (entity == null) {
            // HACK: if the BE request fails, assume that it's a UNIQUE constraint violation
            // TODO: need to find a better way to handle errors here
            this.isTitleUnique = false;
        } else this.reset();
    }

    reset() {
        this._entityType = null;
        this._title = "";
        this._folderId = ROOT_FOLDER_ID;
        this._isTitleUnique = true;
    }
}
