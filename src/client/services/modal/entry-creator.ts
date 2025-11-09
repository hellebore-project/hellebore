import { makeAutoObservable } from "mobx";
import { FormEvent } from "react";

import { EntryInfoResponse, EntityType, ROOT_FOLDER_ID } from "@/domain";
import { ModalKey } from "@/client/constants";
import { CreateEntryEvent, IModalContentManager } from "@/client/interface";
import { Id } from "@/interface";
import { EventProducer } from "@/utils/event";

export class EntryCreator implements IModalContentManager {
    // CONSTANTS
    readonly TITLE = "Create a new entry";

    // STATE
    private _entryTitle = "";
    private _folderId: Id = ROOT_FOLDER_ID;
    private _entityType: EntityType | null = null;
    private _isTitleUnique = true;

    // EVENTS
    onCreateEntry: EventProducer<
        CreateEntryEvent,
        Promise<EntryInfoResponse | null>
    >;
    onClose: EventProducer<void, unknown>;

    constructor() {
        this.onCreateEntry = new EventProducer();
        this.onClose = new EventProducer();
        makeAutoObservable(this, { onCreateEntry: false, onClose: false });
    }

    get key() {
        return ModalKey.EntryCreator;
    }

    get entryTitle() {
        return this._entryTitle;
    }

    set entryTitle(title: string) {
        this._entryTitle = title;
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
        this.entryTitle = "";
        this._isTitleUnique = true;
    }

    async submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const entry = await this.onCreateEntry.produceOne({
            // HACK: assume that the user has entered an entity type
            // TODO: when entity type is null, we need to default to some sort of generic entity
            // without any properties
            entityType: this.entityType as EntityType,
            title: this._entryTitle,
            folderId: this._folderId,
        });

        if (entry == null) {
            // HACK: if the BE request fails, assume that it's a UNIQUE constraint violation
            // TODO: need to find a better way to handle errors here
            this.isTitleUnique = false;
        } else this.onClose.produce();
    }
}
