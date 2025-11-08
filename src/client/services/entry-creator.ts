import { makeAutoObservable } from "mobx";
import { FormEvent } from "react";

import { EntryInfoResponse, EntityType, ROOT_FOLDER_ID } from "@/domain";
import { CreateEntryEvent } from "@/client/interface";
import { Id } from "@/interface";
import { EventProducer } from "@/utils/event";

export class EntryCreator {
    // STATE
    private _title = "";
    private _folderId: Id = ROOT_FOLDER_ID;
    private _entityType: EntityType | null = null;
    private _isTitleUnique = true;

    // EVENTS
    onCreateEntry: EventProducer<
        CreateEntryEvent,
        Promise<EntryInfoResponse | null>
    >;

    constructor() {
        this.onCreateEntry = new EventProducer();
        makeAutoObservable(this, { onCreateEntry: false });
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

    set entityType(value: EntityType | null) {
        this._entityType = value;
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

        const entry = await this.onCreateEntry.produceOne({
            // HACK: assume that the user has entered an entity type
            // TODO: when entity type is null, we need to default to some sort of generic entity
            // without any properties
            entityType: this.entityType as EntityType,
            title: this._title,
            folderId: this._folderId,
        });

        if (entry == null) {
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
