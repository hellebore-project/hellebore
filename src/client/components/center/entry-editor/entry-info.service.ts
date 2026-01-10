import { makeAutoObservable } from "mobx";

import { ChangeEntryEvent } from "@/client/interface";
import { ENTITY_TYPE_LABELS, ENTRY_ID_SENTINEL, EntryType } from "@/domain";
import { EventProducer, MultiEventProducer } from "@/model";

type PrivateKeys = "_titleChanged";

export class EntryInfoService {
    // STATE
    private _id: number = ENTRY_ID_SENTINEL;
    private _entryType: EntryType | null = null;
    private _title = "";
    private _isTitleUnique = true;
    private _titleChanged = false;
    private _loaded = false;

    // EVENTS
    fetchPortalSelector: EventProducer<void, string>;
    onChangeTitle: MultiEventProducer<ChangeEntryEvent, unknown>;

    constructor() {
        this.fetchPortalSelector = new EventProducer();
        this.onChangeTitle = new MultiEventProducer();

        makeAutoObservable<EntryInfoService, PrivateKeys>(this, {
            _titleChanged: false,
            fetchPortalSelector: false,
            onChangeTitle: false,
        });
    }

    get id() {
        return this._id;
    }

    set id(id: number) {
        this._id = id;
    }

    get entryType() {
        return this._entryType;
    }

    set entryType(type: EntryType | null) {
        this._entryType = type;
    }

    get entryTypeLabel() {
        return ENTITY_TYPE_LABELS[this.entryType as EntryType];
    }

    get title() {
        return this._title;
    }

    set title(title: string) {
        if (title == this.title) return;

        this._title = title;
        this._titleChanged = true;

        // the sync will happen immediately so that the title can be validated in real-time;
        // to speed things up, we only sync the title
        this.onChangeTitle.produce({
            id: this._id,
            poll: { id: this._id, syncTitle: true },
        });
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

    load(id: number, type: EntryType, title: string) {
        this.id = id;
        this.entryType = type;
        // mutate the private title variable directly to avoid an unnecessary sync
        this._title = title;
        this.isTitleUnique = true;
        this._loaded = true;
    }
}
