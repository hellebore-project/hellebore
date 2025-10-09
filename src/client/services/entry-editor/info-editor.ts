import { makeAutoObservable } from "mobx";

import { ENTITY_TYPE_LABELS, EntityType } from "@/domain";
import { Id } from "@/interface";
import { EventProducer } from "@/utils/event";

const ENTRY_ID_SENTINEL = -1;

type PrivateKeys = "_titleChanged";

export class EntryInfoEditor {
    private _id: number = ENTRY_ID_SENTINEL;
    private _entityType: EntityType | null = null;
    private _title = "";
    private _isTitleUnique = true;
    private _titleChanged = false;

    onChangeTitle: EventProducer<Id, void>;

    constructor() {
        this.onChangeTitle = new EventProducer();

        makeAutoObservable<EntryInfoEditor, PrivateKeys>(this, {
            onChangeTitle: false,
            _titleChanged: false,
        });
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
        if (title == this.title) return;

        this._title = title;
        this._titleChanged = true;
        this.onChangeTitle.produce(this.id);
    }

    get isTitleUnique() {
        return this._isTitleUnique;
    }

    set isTitleUnique(unique: boolean) {
        this._isTitleUnique = unique;
    }

    get isTitleValid() {
        return this.isTitleUnique && this.title !== "";
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
    }

    reset() {
        this.id = ENTRY_ID_SENTINEL;
        this.entityType = null;
        this.title = "";
        this.isTitleUnique = true;
        this._titleChanged = false;
    }
}
