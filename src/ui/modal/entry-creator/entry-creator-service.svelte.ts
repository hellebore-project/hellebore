import { ModalType } from "@/constants";
import type { CreateEntryEvent, Id, IModalContentManager } from "@/interface";
import { EntryType, ROOT_FOLDER_ID, type EntryInfoResponse } from "@/api";
import { EventProducer, MultiEventProducer } from "@/utils/event-producer";

export class EntryCreatorService implements IModalContentManager {
    readonly id = "modal-entry-creator";
    readonly title = "Create a new entry";

    private _entryTitle = $state("");
    private _folderId: Id = $state(ROOT_FOLDER_ID);
    private _entryType = $state<EntryType | null>(null);
    private _isTitleUnique = $state(true);

    onCreateEntry: EventProducer<
        CreateEntryEvent,
        Promise<EntryInfoResponse | null>
    >;
    onClose: MultiEventProducer<void, unknown>;

    constructor() {
        this.onCreateEntry = new EventProducer();
        this.onClose = new MultiEventProducer();
    }

    get type() {
        return ModalType.EntryCreator;
    }

    get entryTitle() {
        return this._entryTitle;
    }

    set entryTitle(title: string) {
        this._entryTitle = title;
    }

    get folderId() {
        return this._folderId;
    }

    set folderId(folderId: Id) {
        this._folderId = folderId;
    }

    get entryType() {
        return this._entryType;
    }

    set entryType(value: EntryType | null) {
        this._entryType = value;
    }

    get isTitleUnique() {
        return this._isTitleUnique;
    }

    set isTitleUnique(isUnique: boolean) {
        this._isTitleUnique = isUnique;
    }

    initialize(entryType: EntryType | null = null, folderId?: Id) {
        this._entryType = entryType;
        this._folderId = folderId ?? ROOT_FOLDER_ID;
        this._entryTitle = "";
        this._isTitleUnique = true;
    }

    async submit() {
        const entry = await this.onCreateEntry.produce({
            entryType: this.entryType as EntryType,
            title: this._entryTitle,
            folderId: this._folderId,
        });

        if (entry == null) {
            this.isTitleUnique = false;
        } else this.onClose.produce();
    }
}
