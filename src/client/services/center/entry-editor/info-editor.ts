import { makeAutoObservable } from "mobx";

import { ChangeEntryEvent } from "@/client/interface";
import { ENTITY_TYPE_LABELS, EntityType, ENTRY_ID_SENTINEL } from "@/domain";
import { EventProducer } from "@/utils/event";

type PrivateKeys = "_titleChanged";

export class EntryInfoService {
    private _id: number = ENTRY_ID_SENTINEL;
    private _entityType: EntityType | null = null;
    private _title = "";
    private _isTitleUnique = true;
    private _titleChanged = false;
    private _loaded = false;

    onChangeTitle: EventProducer<ChangeEntryEvent, unknown>;

    constructor() {
        this.onChangeTitle = new EventProducer();

        makeAutoObservable<EntryInfoService, PrivateKeys>(this, {
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

        // the sync will be happen immediately so that the title can validated in real-time;
        // to speed things up, we only sycn the title
        this.onChangeTitle.produce({ id: this._id, poll: { syncTitle: true } });
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

    get loaded() {
        return this._loaded;
    }

    load(id: number, type: EntityType, title: string) {
        this.id = id;
        this.entityType = type;
        // mutate the private title variable directly to avoid an unnecessary sync
        this._title = title;
        this.isTitleUnique = true;
        this._loaded = true;
    }
}
